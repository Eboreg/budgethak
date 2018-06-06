/**
 * Övergripande View som sköter den nödvändiga kommunikationen mellan views.
 */
var sunkhak = sunkhak || {};
define([
	'backbone',
	'urljs',
	'models/App',
	'views/MapView',
	'views/SidebarView',
	'views/MenuBarView',
	'views/PlaceView',
	'collections/PlaceCollection',
], function(Backbone, Url, App, MapView, SidebarView, MenuBarView, PlaceView, PlaceCollection) {
	var AppView = Backbone.View.extend({
		//el: '#app',
		tagName : 'section',
		id : 'app',
		collection : new PlaceCollection(),
		placeviews : {},
		
		initialize : function() {
			this.model = new App();
			_.bindAll(this, 'cron30min');
			this.$el.html('<div id="main-wrapper"><div id="map-wrapper"><div id="map-element"></div></div></div>');
			this.mapview = new MapView({ el : this.$("#map-element")[0] });
			this.sidebarview = new SidebarView();
			// MenuBarView behöver ha koll på collection pga autocomplete
			this.menubarview = new MenuBarView({ collection : this.collection });
			this.listenTo(this.model, 'change:filterClosedPlaces change:maxBeerPrice', this.filterPlaces);
			this.listenTo(this.mapview, 'map-click', this.onMapClick);
			this.listenTo(this.mapview, 'map-viewport-change', this.setHash);
			this.listenTo(this.menubarview, 'my-location-click', this.onMyLocationClick);
			this.listenTo(this.menubarview, 'info-icon-click', this.onInfoIconClick);
			this.listenTo(this.menubarview, 'filter-closed-places-click', this.onFilterClosedPlacesClick);
			this.listenTo(this.menubarview, 'max-beer-price-change', this.onMaxBeerPriceChange);
			this.listenTo(this.menubarview, 'autocomplete-select', this.onAutocompleteSelect);
			this.listenTo(this.sidebarview, 'transitionend', this.onSidebarTransitionEnd);
			this.listenTo(this.sidebarview, 'place-open', this.onPlaceOpen);
			this.listenTo(this.sidebarview, 'place-close', this.onPlaceClose);
			this.listenTo(this.sidebarview, 'close', this.onSidebarClose);
			this.listenTo(this.sidebarview, 'info-open', this.onInfoOpen);
			this.listenTo(this.sidebarview, 'info-close', this.onInfoClose);
			this.listenTo(this.sidebarview, 'map-marker-click', this.onSidebarMapMarkerClick);
			window.setInterval(this.cron30min, 60000);
			// Kommer PlaceCollection alltid att vara färdig-bootstrappad när vi är här?
			//this.listenTo(this.collection, 'reset', this.onPlaceReset);
			this.onPlaceReset();
		},
		render : function() {
			this.sidebarview.render();
			this.$("#main-wrapper").append(this.sidebarview.el);
			// Vi måste vänta tills DOM är klart för att rita ut karta
			$(_.bind(function() {
				this.mapview.render();
				this.menubarview.render(this.mapview.map);
			}, this));
			return this;
		},
		renderMap : function(hash) {
			this.sidebarview.model.close();
			this.hashToMapModel(hash);
			this.render();
			//this.mapview.render();
		},
		renderPlace : function(id) {
			var model = this.collection.get(id);
			this.sidebarview.model.set('transition', false);
			this.sidebarview.open();
			this.mapview.reloadMapSize();
			this.mapview.model.set('location', { lat : parseFloat(model.get('lat')), lng : parseFloat(model.get('lng'))});
			this.mapview.model.set('zoom', 17);
			this.render();
			this.showPlace(id);
		},
		showPlace : function(id) {
			var model = this.collection.get(id);
			this.sidebarview.model.set('place', model);
			model.set('opened', true);
		},
		renderInfo : function(hash) {
			this.sidebarview.model.set('infoOpen', true);
			this.menubarview.model.set('infoActive', true);
			this.hashToMapModel(hash);
//			this.mapview.render();
//			this.$el.append(this.mapview.render().el);
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
				if (place.get('opened') && !place.get('visible')) {
					this.sidebarview.model.close();
				}
			}, this);
			this.collection.each(filterFunc);
		},
		setHash : function() {
			var location = this.mapview.model.get('location');
			var hash = '#'+
				this.mapview.model.get('zoom')+'/'+
				location.lat.toPrecision(6)+'/'+
				location.lng.toPrecision(6);
			if (history.replaceState)
				history.replaceState(null, null, window.location.pathname+hash);
		},
		hashToMapModel : function(hash) {
			var arr = hash.split("/");
			if (arr.length < 3)
				return false;
			else {
				this.mapview.model.set('location', { lat : parseFloat(arr[1]), lng : parseFloat(arr[2]) });
				this.mapview.model.set('zoom', parseInt(arr[0]));
				return true;
			}
		},
		
		/* MODELL-/COLLECTION-EVENTS */

		/* Brygga MapView <-> PlaceView
		 * Skapar alla PlaceView:s, lägger till dem i MapView:s markercluster samt lyssnar på deras modeller så att de
		 * kan plockas bort från kartan vid behov och läggas till igen */
		onPlaceReset : function() {
			var markers = [];
			this.collection.each(function(model) {
				if (typeof this.placeviews[model.id] == "undefined") {
					var placeview = new PlaceView({
						model : model,
					});
					placeview.markercluster = this.mapview.markercluster;
					placeview.mapview = this.mapview;
					markers.push(placeview.marker);
					//if (model.get('visible'))
					//this.placeviews[model.id] = placeview;
					this.listenTo(placeview, 'marker-click', this.onPlaceMarkerClick);
				}
			}, this);
			this.mapview.markercluster.addLayers(markers);
/*
			this.mapview.markercluster.addLayers(_.map(this.placeviews, function(placeview) { 
				return placeview.marker; 
			}));
*/
			// Ny loop eftersom mapview.markercluster måste vara färdigpopulerad innan dessa callbacks körs:
			_.each(this.placeviews, function(placeview) {
				this.listenTo(placeview.model, 'change:visible', function(model, value) {
					if (value)
						this.mapview.markercluster.addLayer(placeview.marker);
					else
						this.mapview.markercluster.removeLayer(placeview.marker);
				});
				this.listenTo(placeview.model, 'change:opened', function(model, value) {
					// När platsen är öppnad, ska markören "brytas ut" ur klustret
					if (value) {
						this.mapview.markercluster.removeLayer(placeview.marker);
						this.mapview.addMarker(placeview.marker);
					} else {
						this.mapview.removeMarker(placeview.marker);
						this.mapview.markercluster.addLayer(placeview.marker);
					}
				});
				this.listenTo(placeview, 'marker-click', this.onPlaceMarkerClick);
			}, this);
		},
		/* Brygga PlaceView -> SidebarView */
		onPlaceMarkerClick : function(model) {
			if (model.get('opened')) {
				this.sidebarview.model.set('place', model);
				this.listenToOnce(this.sidebarview, 'fully-open', function() {
					this.mapview.panToIfOutOfBounds([ parseFloat(model.get('lat')), parseFloat(model.get('lng')) ]);
				});
			} else {
				this.sidebarview.model.set('place', null);
			}
		},
		/* Brygga MenuBarView -> MapView */
		onMyLocationClick : function() {
			this.mapview.gotoUserLocation();
		},
		/* Brygga MenuBarView -> SidebarView 
		 * När MenuBarView:s info-icon klickas, ändrar vi Sidebar:s infoOpen så får SidebarView agera på detta */
		onInfoIconClick : function() {
			this.sidebarview.model.set('infoOpen', this.menubarview.model.get('infoActive'));
		},
		/* Brygga MenuBarView -> this.collection -> PlaceView */
		onFilterClosedPlacesClick : function(value) {
			this.model.set('filterClosedPlaces', value);
		},
		/* Brygga MenuBarView -> this.collection -> PlaceView */
		onMaxBeerPriceChange : function(value) {
			this.model.set('maxBeerPrice', value);
		},
		/* Brygga MapView -> SidebarView och MenuBarView */
		onMapClick : function() {
			this.sidebarview.model.close();
		},
		/* Brygga MenuBarView -> SidebarView och MapView */
		onAutocompleteSelect : function(id) {
			var zoomFunc = _.bind(function() {
				var place = this.collection.get(this.sidebarview.model.get('place'));
				this.mapview.flyTo([parseFloat(place.get('lat')), parseFloat(place.get('lng'))], true);
			}, this);
			this.showPlace(id);
			if (this.sidebarview.model.get('fullyOpen'))
				zoomFunc();
			else
				this.listenToOnce(this.sidebarview, 'fully-open', zoomFunc);
		},
		/* Brygga SidebarView -> MapView */
		onSidebarTransitionEnd : function() {
			this.mapview.reloadMapSize();
		},
		/* Brygga SidebarView -> Router och MapView */
		onPlaceOpen : function(model) {
			sunkhak.router.navigate('place/'+model.id);
		},
		onPlaceClose : function(model) {
			model.set('opened', false);
		},
		/* Brygga SidebarView() -> Router och MenuBarView() */
		onInfoOpen : function() {
			sunkhak.router.navigate('info');
			this.setHash();
			this.menubarview.model.set('infoActive', true);
		},
		/* Brygga SidebarView -> MenuBarView */
		onInfoClose : function(model) {
			this.menubarview.model.set('infoActive', false);
		},
		/* Brygga SidebarView -> Router */
		onSidebarClose : function() {
			sunkhak.router.navigate('');
		},
		/* Brygga SidebarView -> this.collection och MapView */
		onSidebarMapMarkerClick : function(model) {
			this.mapview.flyTo([parseFloat(model.get('lat')), parseFloat(model.get('lng'))], true);
			this.showPlace(model.id);
		},
	});
	return AppView;
});
