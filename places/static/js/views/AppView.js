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
			sunkhak.mapview = new MapView({ el : this.$("#map-element")[0] });
			sunkhak.sidebarview = new SidebarView();
			// MenuBarView behöver ha koll på collection pga autocomplete
			sunkhak.menubarview = new MenuBarView({ collection : this.collection });
			this.listenTo(this.model, 'change:filterClosedPlaces change:maxBeerPrice', this.filterPlaces);
			this.listenTo(sunkhak.mapview, 'map-click', this.onMapClick);
			this.listenTo(sunkhak.mapview, 'map-viewport-change', this.setHash);
			this.listenTo(sunkhak.menubarview, 'my-location-click', this.onMyLocationClick);
			this.listenTo(sunkhak.menubarview, 'info-icon-click', this.onInfoIconClick);
			this.listenTo(sunkhak.menubarview, 'filter-closed-places-click', this.onFilterClosedPlacesClick);
			this.listenTo(sunkhak.menubarview, 'max-beer-price-change', this.onMaxBeerPriceChange);
			this.listenTo(sunkhak.menubarview, 'autocomplete-select', this.onAutocompleteSelect);
			this.listenTo(sunkhak.sidebarview, 'transitionend', this.onSidebarTransitionEnd);
			this.listenTo(sunkhak.sidebarview, 'place-open', this.onPlaceOpen);
			this.listenTo(sunkhak.sidebarview, 'place-close', this.onPlaceClose);
			this.listenTo(sunkhak.sidebarview, 'close', this.onSidebarClose);
			this.listenTo(sunkhak.sidebarview, 'info-open', this.onInfoOpen);
			this.listenTo(sunkhak.sidebarview, 'info-close', this.onInfoClose);
			this.listenTo(sunkhak.sidebarview, 'map-marker-click', this.onSidebarMapMarkerClick);
			window.setInterval(this.cron30min, 60000);
			// Kommer PlaceCollection alltid att vara färdig-bootstrappad när vi är här?
			//this.listenTo(this.collection, 'reset', this.onPlaceReset);
			this.onPlaceReset();
		},
		render : function() {
			sunkhak.sidebarview.render();
			this.$("#main-wrapper").append(sunkhak.sidebarview.el);
			// Vi måste vänta tills DOM är klart för att rita ut karta
			$(_.bind(function() {
				sunkhak.mapview.render();
				sunkhak.menubarview.render(sunkhak.mapview.map);
			}), this);
			return this;
		},
		renderMap : function(hash) {
			sunkhak.sidebarview.model.close();
			this.hashToMapModel(hash);
			this.render();
			//sunkhak.mapview.render();
		},
		renderPlace : function(id) {
			var model = this.collection.get(id);
			sunkhak.sidebarview.model.set('transition', false);
			sunkhak.sidebarview.open();
			sunkhak.mapview.reloadMapSize();
			sunkhak.mapview.model.set('location', { lat : parseFloat(model.get('lat')), lng : parseFloat(model.get('lng'))});
			sunkhak.mapview.model.set('zoom', 17);
			this.render();
			this.showPlace(id);
		},
		showPlace : function(id) {
			var model = this.collection.get(id);
			sunkhak.sidebarview.model.set('place', model);
			this.placeviews[id].model.set('opened', true);
		},
		renderInfo : function(hash) {
			sunkhak.sidebarview.model.set('infoOpen', true);
			sunkhak.menubarview.model.set('infoActive', true);
			this.hashToMapModel(hash);
//			sunkhak.mapview.render();
//			this.$el.append(sunkhak.mapview.render().el);
			this.render();
		},
		cron30min : function() {
			var d = new Date();
			if (d.getMinutes() % 30 === 0) {
				this.listenToOnce(this.collection, 'sync', this.filterPlaces);
				this.collection.fetch();
			}
		},
		filterPlaces : function() {
			var filterFunc = _.bind(function(place) {
				place.filter({ maxBeerPrice : this.model.get('maxBeerPrice'), openNow : this.model.get('filterClosedPlaces') });
			}, this);
			this.collection.each(filterFunc);
		},
		setHash : function() {
			var location = sunkhak.mapview.model.get('location');
			var hash = '#'+
				sunkhak.mapview.model.get('zoom')+'/'+
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
				sunkhak.mapview.model.set('location', { lat : parseFloat(arr[1]), lng : parseFloat(arr[2]) });
				sunkhak.mapview.model.set('zoom', parseInt(arr[0]));
				return true;
			}
		},
		
		/* MODELL-/COLLECTION-EVENTS */

		/* Brygga MapView <-> PlaceView
		 * Skapar alla PlaceView:s, lägger till dem i MapView:s markercluster samt lyssnar på deras modeller så att de
		 * kan plockas bort från kartan vid behov och läggas till igen */
		onPlaceReset : function() {
			this.collection.each(function(model) {
				if (typeof this.placeviews[model.id] == "undefined") {
					var placeview = new PlaceView({
						model : model,
					});
					//if (model.get('visible'))
					this.placeviews[model.id] = placeview;
				}
			}, this);
			sunkhak.mapview.markercluster.addLayers(_.map(this.placeviews, function(placeview) { 
				return placeview.marker; 
			}));
			// Ny loop eftersom mapview.markercluster måste vara färdigpopulerad innan dessa callbacks körs:
			_.each(this.placeviews, function(placeview) {
				this.listenTo(placeview.model, 'change:visible', function(model, value) {
					if (value)
						sunkhak.mapview.markercluster.addLayer(placeview.marker);
					else
						sunkhak.mapview.markercluster.removeLayer(placeview.marker);
				});
				this.listenTo(placeview.model, 'change:opened', function(model, value) {
					// När platsen är öppnad, ska markören "brytas ut" ur klustret
					if (value) {
						sunkhak.mapview.markercluster.removeLayer(placeview.marker);
						sunkhak.mapview.addMarker(placeview.marker);
					} else {
						sunkhak.mapview.removeMarker(placeview.marker);
						sunkhak.mapview.markercluster.addLayer(placeview.marker);
					}
				});
				this.listenTo(placeview, 'marker-click', this.onPlaceMarkerClick);
			}, this);
		},
		/* Brygga PlaceView -> SidebarView */
		onPlaceMarkerClick : function(model) {
			if (model.get('opened')) {
				sunkhak.sidebarview.model.set('place', model);
				this.listenToOnce(sunkhak.sidebarview, 'fully-open', function() {
					sunkhak.mapview.panToIfOutOfBounds([ parseFloat(model.get('lat')), parseFloat(model.get('lng')) ]);
				});
			} else {
				sunkhak.sidebarview.model.set('place', null);
			}
		},
		/* Brygga MenuBarView -> MapView */
		onMyLocationClick : function() {
			sunkhak.mapview.gotoUserLocation();
		},
		/* Brygga MenuBarView -> SidebarView 
		 * När MenuBarView:s info-icon klickas, ändrar vi Sidebar:s infoOpen så får SidebarView agera på detta */
		onInfoIconClick : function() {
			sunkhak.sidebarview.model.set('infoOpen', sunkhak.menubarview.model.get('infoActive'));
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
			sunkhak.sidebarview.model.close();
		},
		/* Brygga MenuBarView -> SidebarView och MapView */
		onAutocompleteSelect : function(id) {
			var zoomFunc = _.bind(function() {
				var place = this.collection.get(sunkhak.sidebarview.model.get('place'));
				sunkhak.mapview.flyTo([parseFloat(place.get('lat')), parseFloat(place.get('lng'))], true);
			}, this);
			this.showPlace(id);
			if (sunkhak.sidebarview.model.get('fullyOpen'))
				zoomFunc();
			else
				this.listenToOnce(sunkhak.sidebarview, 'fully-open', zoomFunc);
		},
		/* Brygga SidebarView -> MapView */
		onSidebarTransitionEnd : function() {
			sunkhak.mapview.reloadMapSize();
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
			sunkhak.menubarview.model.set('infoActive', true);
		},
		/* Brygga SidebarView -> MenuBarView */
		onInfoClose : function(model) {
			sunkhak.menubarview.model.set('infoActive', false);
		},
		/* Brygga SidebarView -> Router */
		onSidebarClose : function() {
			sunkhak.router.navigate('');
		},
		/* Brygga SidebarView -> this.collection och MapView */
		onSidebarMapMarkerClick : function(model) {
			sunkhak.mapview.flyTo([parseFloat(model.get('lat')), parseFloat(model.get('lng'))], true);
			this.showPlace(model.id);
		},
	});
	return AppView;
});
