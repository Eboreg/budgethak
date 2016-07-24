var sunkhak = sunkhak || {};
define([
	'backbone',
	'underscore',
	'views/MapView',
	'views/SidebarView',
	'collections/PlaceCollection'
], function(Backbone, _, MapView, SidebarView, PlaceCollection) {
	var Router = Backbone.Router.extend({
		routes : {
			'place/:id' : 'showPlace',
			'info' : 'showInfo',
			'*default' : 'showMap',
		},
		collection : new PlaceCollection(),

		initialize : function() {
			_.bindAll(this, 'showPlace', 'showMap', 'showPlaceWithZoom', 'whenPlaceSidebarOpened', 'whenInfoSidebarOpened',
				'whenPlaceSidebarClosed');
			sunkhak.mapview = new MapView({ collection : this.collection });
			sunkhak.sidebarview = new SidebarView();
			this.setupListeners();
		},
		setupListeners : function() {
			// Lyssnare på PlaceView (via Backbone):
			Backbone.on('placeview:place-marker-clicked', sunkhak.sidebarview.togglePlace, sunkhak.sidebarview);
			// Lyssnare på SidebarView:
			this.listenTo(sunkhak.sidebarview, 'place-opened', this.whenPlaceSidebarOpened);
			this.listenTo(sunkhak.sidebarview, 'place-closed', this.whenPlaceSidebarClosed);
			this.listenTo(sunkhak.sidebarview, 'close', this.showMap);
			this.listenTo(sunkhak.sidebarview, 'info-opened', this.whenInfoSidebarOpened);
			this.listenTo(sunkhak.sidebarview, 'map-marker-click', this.showPlaceWithZoom);
			sunkhak.sidebarview.on('info-closed', sunkhak.mapview.deactivateInfoIcon, sunkhak.mapview);
			// Lyssnare på MapView:
			sunkhak.mapview.on('map:click', sunkhak.sidebarview.close, sunkhak.sidebarview);
			sunkhak.mapview.on('info-icon-clicked', sunkhak.sidebarview.toggleInfo, sunkhak.sidebarview);
			this.listenTo(sunkhak.mapview, 'autocomplete-select', this.showPlaceWithZoom);
		},
		showPlace : function(id) {
			var model = this.collection.get(id);
			if (!sunkhak.mapview.mapRendered) {
				sunkhak.sidebarview.openWithoutTransition();
				sunkhak.mapview.reloadMapSize();
				sunkhak.mapview.render({ 
					startpos : [parseFloat(model.get('lat')), parseFloat(model.get('lng'))],
					zoom : 17,
				});
			}
			sunkhak.sidebarview.openPlace(model);
			// Vi kör ingen navigate() här utan i callbacken this.whenPlaceSidebarOpened()
		},
		showInfo : function() {
			if (!sunkhak.mapview.mapRendered) {
				sunkhak.mapview.render();
			} else {
				this.navigate('info');
			}
			sunkhak.sidebarview.openInfo();
		},
		showMap : function() {
			if (!sunkhak.mapview.mapRendered) {
				sunkhak.mapview.render();
			} else {
				sunkhak.mapview.reloadMapSize();
				this.navigate('');
			}
		},
		// När kartan alltid ska panoreras och zoomas, även om stället redan är inom bounds.
		// Gäller f.n. endast vid autocomplete-select.
		showPlaceWithZoom : function(id) {
			var zoomFunc = function(model) {
				sunkhak.mapview.panTo([parseFloat(model.get('lat')), parseFloat(model.get('lng'))], true);
			};
			zoomFunc = _.bind(zoomFunc, this);
			this.listenToOnce(sunkhak.sidebarview, 'place-opened', zoomFunc);
			this.showPlace(id);
		},
		
		// Event-callbacks:
		whenPlaceSidebarOpened : function(model) {
			sunkhak.mapview.reloadMapSize();
			sunkhak.mapview.panToIfOutOfBounds([parseFloat(model.get('lat')), parseFloat(model.get('lng'))]);
			Backbone.trigger('place-opened', model);
			this.navigate('place/'+model.id);
		},
		whenPlaceSidebarClosed : function(model) {
			Backbone.trigger('place-closed', model);
		},
		whenInfoSidebarOpened : function() {
			this.navigate('info');
			sunkhak.mapview.activateInfoIcon();
		},
	});
	return Router;
});