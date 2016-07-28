/**
 * Övergripande View som sköter den nödvändiga kommunikationen mellan views.
 */
var sunkhak = sunkhak || {};
define([
	'backbone',
	'models/App',
	'views/MapView',
	'views/SidebarView',
	'views/MenuBarView',
	'views/PlaceView',
	'collections/PlaceCollection',
], function(Backbone, App, MapView, SidebarView, MenuBarView, PlaceView, PlaceCollection) {
	var AppView = Backbone.View.extend({
		el: '#app',
		model : new App(),
		collection : new PlaceCollection(),
		placeviews : {},
		
		initialize : function() {
			_.bindAll(this, 'cron30min');
			sunkhak.mapview = new MapView();
			sunkhak.sidebarview = new SidebarView();
			// MenuBarView behöver ha koll på collection pga autocomplete
			sunkhak.menubarview = new MenuBarView({ collection : this.collection });
			sunkhak.menubarview.render(sunkhak.mapview.map);
			this.listenTo(this.collection, 'reset', this.onPlaceReset);
			this.listenTo(this.model, 'change:filterClosedPlaces change:maxBeerPrice', this.filterPlaces);
			this.listenTo(sunkhak.mapview, 'map-click', this.onMapClick);
			this.listenTo(sunkhak.mapview, 'map-location-found', this.onMapLocationFound);
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
			// Kommer PlaceCollection alltid att vara färdig-bootstrappad när vi är här?
			this.onPlaceReset();
		},
		showMap : function() {
			sunkhak.mapview.render();
		},
		showPlace : function(id) {
			var model = this.collection.get(id);
			if (!sunkhak.mapview.model.get('rendered')) {
				sunkhak.sidebarview.model.set('transition', false);
				sunkhak.sidebarview.open();
				sunkhak.mapview.reloadMapSize();
				sunkhak.mapview.model.set('location', [parseFloat(model.get('lat')), parseFloat(model.get('lng'))]);
				sunkhak.mapview.model.set('zoom', 17);
				sunkhak.mapview.render();
			}
			sunkhak.sidebarview.model.set('place', model);
			this.placeviews[id].model.set('opened', true);
		},
		showInfo : function() {
			sunkhak.sidebarview.model.set('infoOpen', true);
			sunkhak.menubarview.model.set('infoActive', true);
			sunkhak.mapview.render();
		},
		closeAllPlaces : function() {
			this.collection.each(function(model) {
				model.set('opened', false);
			});
		},
		cron30min : function() {
			var d = new Date();
			if (d.getMinutes() % 30 === 0) {
				this.collection.fetch();
				this.filter({ openNow : this.filterClosedPlaces });
			}
		},
		filterPlaces : function() {
			var filterFunc = _.bind(function(place) {
				place.filter({ maxBeerPrice : this.model.get('maxBeerPrice'), openNow : this.model.get('filterClosedPlaces') });
			}, this);
			this.collection.each(filterFunc);
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
					if (model.get('visible'))
						this.placeviews[model.id] = placeview;
					this.listenTo(model, 'change:visible', function(model, value) {
						if (value)
							sunkhak.mapview.markercluster.addLayer(placeview.marker);
						else
							sunkhak.mapview.markercluster.removeLayer(placeview.marker);
					});
					this.listenTo(placeview, 'marker-click', this.onPlaceMarkerClick);
				}
			}, this);
			sunkhak.mapview.markercluster.addLayers(_.map(this.placeviews, function(placeview) { return placeview.marker; }));
		},
		/* Brygga PlaceView -> SidebarView */
		onPlaceMarkerClick : function(model) {
			if (model.get('opened')) {
				sunkhak.sidebarview.model.set('place', model);
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
				sunkhak.mapview.panTo([parseFloat(place.get('lat')), parseFloat(place.get('lng'))], true);
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
		/* Brygga SidebarView -> Router */
		onPlaceOpen : function(model) {
			sunkhak.router.navigate('place/'+model.id);
		},
		onPlaceClose : function(model) {
			model.set('opened', false);
		},
		/* Brygga SidebarView() -> Router och MenuBarView() */
		onInfoOpen : function() {
			sunkhak.router.navigate('info');
			sunkhak.menubarview.model.set('infoActive', true);
		},
		/* Brygga SidebarView -> MenuBarView */
		onInfoClose : function(model) {
			sunkhak.menubarview.model.set('infoActive', false);
		},
		/* Brygga SidebarView -> Router */
		onSidebarClose : function() {
			sunkhak.router.navigate('');
		}
	});
	return AppView;
});
