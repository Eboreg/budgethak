/**
 * Övergripande View som sköter den nödvändiga kommunikationen mellan views.
 */
define([
	'backbone',
	'jquery',
	'models/App',
	'models/Map',
	'views/MapView',
	'views/SidebarView',
	'views/MenuBarView',
	'views/PlaceView',
	'views/ModalView',
	'collections/PlaceCollection',
	'settings',
], function(Backbone, $, App, Map, MapView, SidebarView, MenuBarView, PlaceView, ModalView, PlaceCollection, settings) {
	var AppView = Backbone.View.extend({
		tagName : 'section',
		id : 'app',
		
		initialize : function() {
			this.model = App;
			_.bindAll(this, 'cron30min');
			this.$el.html('<div id="main-wrapper"><div id="map-wrapper"></div></div>');
			// MenuBarView behöver ha koll på collection pga autocomplete
			this.listenTo(this.model, 'change:filterClosedPlaces change:maxBeerPrice', this.filterPlaces);
			//this.listenTo(PlaceCollection, 'change:visible', )   // ???
			MenuBarView.on('my-location-click', MapView.gotoUserLocation, MapView);
			this.listenTo(MenuBarView, 'filter-closed-places-click', this.toggleFilterClosedPlaces);
			this.listenTo(MenuBarView, 'max-beer-price-change', this.setMaxBeerPrice);
			this.listenTo(MenuBarView, 'autocomplete-select', this.autocompleteSelected);
			this.listenTo(SidebarView, 'transitionend', MapView.reloadMapSize);
			this.listenTo(SidebarView, 'map-marker-click', this.flyToPlace);
			this.listenTo(SidebarView, 'close-button-click', function() { this.trigger('user-closed-sidebar'); })
			window.setInterval(this.cron30min, 60000);
			// Kommer PlaceCollection alltid att vara färdig-bootstrappad när vi är här?
			//this.listenTo(PlaceCollection, 'reset', this.renderAllMarkers);
			this.renderAllMarkers();
		},
		render : function() {
			SidebarView.render();
			this.$("#main-wrapper").append(SidebarView.el);
			this.$("#map-wrapper").append(MapView.el);
			this.$("#main-wrapper").append(ModalView.el);
			// Vi måste vänta tills DOM är klart för att rita ut karta
			$(_.bind(function() {
				MapView.render();
				MenuBarView.render(MapView.map);
			}, this));
			return this;
		},
		// Anropas av router
		renderMap : function(params) {
			SidebarView.model.close();
			if (params)
				Map.set({ zoom : params.zoom, location : params.location });
			this.render();
		},
		// Anropas av router
		renderPlace : function(slug) {
			var place = PlaceCollection.get(slug);
			if (typeof place === "undefined") {
				this.renderMap();
			} else {
				SidebarView.model.set('transition', false);
				SidebarView.open();
				MapView.reloadMapSize();
				Map.set({
					location : { lat : parseFloat(place.get('lat')), lng : parseFloat(place.get('lng'))},
					zoom : settings.maxZoom,
				});
				this.render();
				this.showPlace(slug);
			}
		},
		showPlace : function(slug) {
			var place = PlaceCollection.get(slug);
			SidebarView.model.set('place', place);
			place.set('opened', true);
		},
		// Anropas av router
		renderInfo : function(params) {
			SidebarView.model.set('infoOpen', true);
			MenuBarView.model.set('infoActive', true);
			if (params)
				Map.set({ zoom : params.zoom, location : params.location });
			this.render();
		},
		cron30min : function() {
			var d = new Date();
			if (d.getMinutes() % 30 === 0) {
				this.listenToOnce(PlaceCollection, 'sync', this.filterPlaces);
				PlaceCollection.fetch();
			}
		},
		// Kör filter() på alla Place:s med aktuella maxBeerPrice och openNow som parametrar
		filterPlaces : function() {
			var filterFunc = _.bind(function(place) {
				place.filter({ maxBeerPrice : this.model.get('maxBeerPrice'), openNow : this.model.get('filterClosedPlaces') });
			}, this);
			PlaceCollection.each(filterFunc);
		},

		/* Brygga MapView <-> PlaceView
		 * Skapar alla PlaceView:s, lägger till dem i MapView:s markercluster samt lyssnar på deras modeller så att de
		 * kan plockas bort från kartan vid behov och läggas till igen 
		 * Körs när PlaceCollection har resettats
		 */
		renderAllMarkers : function() {
			var markers = [];
			PlaceCollection.each(function(place) {
				var placeview = new PlaceView({
					model : place,
				});
				placeview.markercluster = MapView.markercluster;
				placeview.mapview = MapView;
				markers.push(placeview.marker);
				this.listenTo(placeview, 'marker-click', this.placeMarkerClicked);
			}, this);
			MapView.markercluster.addLayers(markers);
		},
		/* Brygga PlaceView -> SidebarView */
		placeMarkerClicked : function(place) {
			if (place.get('opened')) {
				SidebarView.model.set('place', place);
				this.listenToOnce(SidebarView, 'fully-open', function() {
					MapView.panToIfOutOfBounds([ parseFloat(place.get('lat')), parseFloat(place.get('lng')) ]);
				});
				this.trigger('user-opened-place', { id : place.id });
			} else {
				SidebarView.model.set('place', null);
				this.trigger('user-closed-sidebar');
			}
		},
		/* Brygga MenuBarView -> PlaceCollection -> PlaceView */
		toggleFilterClosedPlaces : function(value) {
			this.model.set('filterClosedPlaces', value);
		},
		/* Brygga MenuBarView -> PlaceCollection -> PlaceView */
		setMaxBeerPrice : function(value) {
			this.model.set('maxBeerPrice', value);
		},
		/* Brygga MenuBarView -> SidebarView och MapView */
		autocompleteSelected : function(id) {
			var place = PlaceCollection.get(id);
			this.trigger('user-opened-place', { 
				id : place.id,
				zoom : settings.maxZoom, 
				location : {
					lat : parseFloat(place.get('lat')),
					lng : parseFloat(place.get('lng')),
				},
			});
			this.flyToPlace(place);
		},
		/* Brygga SidebarView -> PlaceCollection och MapView */
		flyToPlace : function(place) {
			var flyFunc = _.bind(function() {
				MapView.flyTo([parseFloat(SidebarView.place.get('lat')), parseFloat(SidebarView.place.get('lng'))], true);
			}, this);
			this.showPlace(place.id);
			if (SidebarView.model.get('fullyOpen'))
				flyFunc();
			else
				this.listenToOnce(SidebarView, 'fully-open', flyFunc);
		},
	});
	return new AppView();
});
