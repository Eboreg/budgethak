/**
 * Övergripande View som sköter den nödvändiga kommunikationen mellan views.
 */
var budgethak = budgethak || {};
define([
	'backbone',
	'jquery',
	'models/App',
	'models/Map',
	'views/MapView',
	'views/SidebarView',
	'views/MenuBarView',
	'views/PlaceView',
	'collections/PlaceCollection',
	'settings',
], function(Backbone, $, App, Map, MapView, SidebarView, MenuBarView, PlaceView, PlaceCollection, settings) {
	var AppView = Backbone.View.extend({
		//el: '#app',
		tagName : 'section',
		id : 'app',
		collection : PlaceCollection,
		
		initialize : function() {
			this.model = App;
			_.bindAll(this, 'cron30min');
			this.$el.html('<div id="main-wrapper"><div id="map-wrapper"></div></div>');
			this.sidebarview = new SidebarView();
			// MenuBarView behöver ha koll på collection pga autocomplete
			this.menubarview = new MenuBarView({ collection : this.collection });
			this.listenTo(this.model, 'change:filterClosedPlaces change:maxBeerPrice', this.filterPlaces);
			//this.listenTo(this.collection, 'change:visible', )   // ???
			this.menubarview.on('my-location-click', MapView.gotoUserLocation, MapView);
			this.listenTo(this.menubarview, 'info-icon-click', this.infoIconClicked);
			this.listenTo(this.menubarview, 'filter-closed-places-click', this.toggleFilterClosedPlaces);
			this.listenTo(this.menubarview, 'max-beer-price-change', this.setMaxBeerPrice);
			this.listenTo(this.menubarview, 'autocomplete-select', this.autocompleteSelected);
			this.listenTo(this.sidebarview, 'transitionend', MapView.reloadMapSize);
			this.listenTo(this.sidebarview, 'place-open', this.onPlaceOpen);
			this.listenTo(this.sidebarview, 'place-close', this.onPlaceClose);
			this.listenTo(this.sidebarview, 'close', this.onSidebarClose);
			this.listenTo(this.sidebarview, 'info-open', this.onInfoOpen);
			this.listenTo(this.sidebarview, 'info-close', this.onInfoClose);
			this.listenTo(this.sidebarview, 'map-marker-click', this.flyToPlace);
			this.listenTo(this.sidebarview, 'close-button-click', function() { this.trigger('user-closed-sidebar'); })
			window.setInterval(this.cron30min, 60000);
			// Kommer PlaceCollection alltid att vara färdig-bootstrappad när vi är här?
			//this.listenTo(this.collection, 'reset', this.renderAllMarkers);
			this.renderAllMarkers();
		},
		render : function() {
			this.sidebarview.render();
			this.$("#main-wrapper").append(this.sidebarview.el);
			this.$("#map-wrapper").append(MapView.el);
			// Vi måste vänta tills DOM är klart för att rita ut karta
			$(_.bind(function() {
				MapView.render();
				this.menubarview.render(MapView.map);
			}, this));
			return this;
		},
		// Anropas av router
		renderMap : function(params) {
			this.sidebarview.model.close();
			if (params)
				Map.set({ zoom : params.zoom, location : { lat : params.lat, lng : params.lng }});
			this.render();
		},
		// Anropas av router
		renderPlace : function(slug) {
			var place = this.collection.get(slug);
			if (typeof place === "undefined") {
				this.renderMap();
			} else {
				this.sidebarview.model.set('transition', false);
				this.sidebarview.open();
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
			var place = this.collection.get(slug);
			this.sidebarview.model.set('place', place);
			place.set('opened', true);
		},
		// Anropas av router
		renderInfo : function(params) {
			this.sidebarview.model.set('infoOpen', true);
			this.menubarview.model.set('infoActive', true);
			if (params)
				Map.set({ zoom : params.zoom, location : { lat : params.lat, lng : params.lng }});
			this.render();
		},
		cron30min : function() {
			var d = new Date();
			if (d.getMinutes() % 30 === 0) {
				this.listenToOnce(this.collection, 'sync', this.filterPlaces);
				this.collection.fetch();
			}
		},
		// Kör filter() på alla Place:s med aktuella maxBeerPrice och openNow som parametrar
		filterPlaces : function() {
			var filterFunc = _.bind(function(place) {
				place.filter({ maxBeerPrice : this.model.get('maxBeerPrice'), openNow : this.model.get('filterClosedPlaces') });
			}, this);
			this.collection.each(filterFunc);
		},

		/* Brygga MapView <-> PlaceView
		 * Skapar alla PlaceView:s, lägger till dem i MapView:s markercluster samt lyssnar på deras modeller så att de
		 * kan plockas bort från kartan vid behov och läggas till igen 
		 * Körs när PlaceCollection har resettats
		 */
		renderAllMarkers : function() {
			var markers = [];
			this.collection.each(function(place) {
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
				this.sidebarview.model.set('place', place);
				this.listenToOnce(this.sidebarview, 'fully-open', function() {
					MapView.panToIfOutOfBounds([ parseFloat(place.get('lat')), parseFloat(place.get('lng')) ]);
				});
				this.trigger('user-opened-place', { id : place.id });
			} else {
				this.sidebarview.model.set('place', null);
				this.trigger('user-closed-sidebar');
			}
		},
		/* Brygga MenuBarView -> SidebarView 
		 * När MenuBarView:s info-icon klickas, ändrar vi Sidebar:s infoOpen så får SidebarView agera på detta */
		infoIconClicked : function() {
			var infoOpen = this.menubarview.model.get('infoActive');
			this.sidebarview.model.set('infoOpen', infoOpen);
			if (infoOpen) {
				this.trigger('user-opened-info');
			} else {
				this.trigger('user-closed-sidebar');
			}
		},
		/* Brygga MenuBarView -> this.collection -> PlaceView */
		toggleFilterClosedPlaces : function(value) {
			this.model.set('filterClosedPlaces', value);
		},
		/* Brygga MenuBarView -> this.collection -> PlaceView */
		setMaxBeerPrice : function(value) {
			this.model.set('maxBeerPrice', value);
		},
		/* Brygga MenuBarView -> SidebarView och MapView */
		autocompleteSelected : function(id) {
			var place = this.collection.get(id);
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
		/* Brygga SidebarView -> this.collection och MapView */
		flyToPlace : function(place) {
			var flyFunc = _.bind(function() {
				MapView.flyTo([parseFloat(this.sidebarview.place.get('lat')), parseFloat(this.sidebarview.place.get('lng'))], true);
			}, this);
			this.showPlace(place.id);
			if (this.sidebarview.model.get('fullyOpen'))
				flyFunc();
			else
				this.listenToOnce(this.sidebarview, 'fully-open', flyFunc);
		},
		/* Brygga SidebarView -> Router */
		onPlaceOpen : function(place) {
			//router.navigate('place/'+place.id+'/');
		},
		onPlaceClose : function(place) {
			place.set('opened', false);
		},
		/* Brygga SidebarView() -> Router och MenuBarView() */
		onInfoOpen : function() {
			//router.navigate('info/');
			//this.setHash();
			this.menubarview.model.set('infoActive', true);
		},
		/* Brygga SidebarView -> MenuBarView */
		onInfoClose : function() {
			this.menubarview.model.set('infoActive', false);
		},
		/* Brygga SidebarView -> Router */
		onSidebarClose : function() {
			//router.navigate('');
		},
	});
	return new AppView();
});
