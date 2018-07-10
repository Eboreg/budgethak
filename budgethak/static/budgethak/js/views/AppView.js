/**
 * Övergripande View som sköter den nödvändiga kommunikationen mellan views.
 */
var budgethak = budgethak || {};
define([
	'backbone',
	'jquery',
	'models/App',
	'views/MapView',
	'views/SidebarView',
	'views/MenuBarView',
	'views/PlaceView',
	'collections/PlaceCollection',
], function(Backbone, $, App, MapView, SidebarView, MenuBarView, PlaceView, PlaceCollection) {
	var AppView = Backbone.View.extend({
		//el: '#app',
		tagName : 'section',
		id : 'app',
		collection : PlaceCollection,
		
		initialize : function() {
			this.model = App;
			_.bindAll(this, 'cron30min');
			this.$el.html('<div id="main-wrapper"><div id="map-wrapper"><div id="map-element"></div></div></div>');
			this.mapview = new MapView({ el : this.$("#map-element")[0] });
			this.sidebarview = new SidebarView();
			// MenuBarView behöver ha koll på collection pga autocomplete
			this.menubarview = new MenuBarView({ collection : this.collection });
			this.listenTo(this.model, 'change:filterClosedPlaces change:maxBeerPrice', this.filterPlaces);
			//this.listenTo(this.collection, 'change:visible', )   // ???
			this.mapview.on('map-click', this.sidebarview.model.close, this.sidebarview.model);
			this.listenTo(this.mapview, 'map-viewport-change', this.setHash);
			this.menubarview.on('my-location-click', this.mapview.gotoUserLocation, this.mapview);
			this.listenTo(this.menubarview, 'info-icon-click', this.toggleInfoOpen);
			this.listenTo(this.menubarview, 'filter-closed-places-click', this.toggleFilterClosedPlaces);
			this.listenTo(this.menubarview, 'max-beer-price-change', this.setMaxBeerPrice);
			this.listenTo(this.menubarview, 'autocomplete-select', this.flyToPlaceId);
			this.listenTo(this.sidebarview, 'transitionend', this.mapview.reloadMapSize);
			this.listenTo(this.sidebarview, 'place-open', this.onPlaceOpen);
			this.listenTo(this.sidebarview, 'place-close', this.onPlaceClose);
			this.listenTo(this.sidebarview, 'close', this.onSidebarClose);
			this.listenTo(this.sidebarview, 'info-open', this.onInfoOpen);
			this.listenTo(this.sidebarview, 'info-close', this.onInfoClose);
			this.listenTo(this.sidebarview, 'map-marker-click', this.flyToPlace);
			window.setInterval(this.cron30min, 60000);
			// Kommer PlaceCollection alltid att vara färdig-bootstrappad när vi är här?
			//this.listenTo(this.collection, 'reset', this.renderAllMarkers);
			this.renderAllMarkers();
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
			var place = this.collection.get(id);
			this.sidebarview.model.set('transition', false);
			this.sidebarview.open();
			this.mapview.reloadMapSize();
			this.mapview.model.set('location', { lat : parseFloat(place.get('lat')), lng : parseFloat(place.get('lng'))});
			this.mapview.model.set('zoom', 17);
			this.render();
			this.showPlace(id);
		},
		showPlace : function(id) {
			var place = this.collection.get(id);
			this.sidebarview.model.set('place', place);
			place.set('opened', true);
		},
		renderInfo : function(hash) {
			this.sidebarview.model.set('infoOpen', true);
			this.menubarview.model.set('infoActive', true);
			this.hashToMapModel(hash);
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
		// Sätter url:ens hashsträng enligt data från map-modellen
		setHash : function() {
			var location = this.mapview.model.get('location');
			var hash = '#'+
				this.mapview.model.get('zoom')+'/'+
				location.lat.toPrecision(6)+'/'+
				location.lng.toPrecision(6);
			if (history.replaceState)
				history.replaceState(null, null, window.location.pathname+hash);
		},
		// Tar hash-strängen och skickar dess data till map-modellen (motsatsen till setHash())
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
				placeview.markercluster = this.mapview.markercluster;
				placeview.mapview = this.mapview;
				markers.push(placeview.marker);
				this.listenTo(placeview, 'marker-click', this.togglePlaceOpen);
			}, this);
			this.mapview.markercluster.addLayers(markers);
		},
		/* Brygga PlaceView -> SidebarView */
		togglePlaceOpen : function(place) {
			if (place.get('opened')) {
				this.sidebarview.model.set('place', place);
				this.listenToOnce(this.sidebarview, 'fully-open', function() {
					this.mapview.panToIfOutOfBounds([ parseFloat(place.get('lat')), parseFloat(place.get('lng')) ]);
				});
			} else {
				this.sidebarview.model.set('place', null);
			}
		},
		/* Brygga MenuBarView -> SidebarView 
		 * När MenuBarView:s info-icon klickas, ändrar vi Sidebar:s infoOpen så får SidebarView agera på detta */
		toggleInfoOpen : function() {
			this.sidebarview.model.set('infoOpen', this.menubarview.model.get('infoActive'));
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
		flyToPlaceId : function(id) {
			var place = this.collection.get(id);
			this.flyToPlace(place);
		},
		/* Brygga SidebarView -> this.collection och MapView */
		flyToPlace : function(place) {
			var flyFunc = _.bind(function() {
				this.mapview.flyTo([parseFloat(this.sidebarview.place.get('lat')), parseFloat(this.sidebarview.place.get('lng'))], true);
			}, this);
			this.showPlace(place.id);
			if (this.sidebarview.model.get('fullyOpen'))
				flyFunc();
			else
				this.listenToOnce(this.sidebarview, 'fully-open', flyFunc);
		},
		/* Brygga SidebarView -> Router */
		onPlaceOpen : function(place) {
			budgethak.router.navigate('place/'+place.id+'/');
		},
		onPlaceClose : function(place) {
			place.set('opened', false);
		},
		/* Brygga SidebarView() -> Router och MenuBarView() */
		onInfoOpen : function() {
			budgethak.router.navigate('info/');
			this.setHash();
			this.menubarview.model.set('infoActive', true);
		},
		/* Brygga SidebarView -> MenuBarView */
		onInfoClose : function() {
			this.menubarview.model.set('infoActive', false);
		},
		/* Brygga SidebarView -> Router */
		onSidebarClose : function() {
			budgethak.router.navigate('');
		},
	});
	return AppView;
});
