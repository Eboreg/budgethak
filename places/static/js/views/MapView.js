/**
 * Vyn har direkt kännedom om modellen då det ej finns anledning att ha någon Collection (vi använder bara en karta).
 * Förändringar i geolocation räknas som en användarinteraktion och tas omhand här.
 * 
 * Properties
 * el : kartelementet
 * model : sunkhak.Map (används ännu bara för att ange defaultvärden; kan ej hämta eller lagra några data någonstans)
 * map : 
 * mapEvents : lyssnar efter events på 'map'
 * collection : PlaceCollection (sätts av AppView)
 * 
 * Events:
 * 	Backbone.'mapview:map:idle' : UserPlaceView ritar ut användarmarkör (om position finns)
 */
define([
	'backbone',
	'underscore',
	'leaflet',
	'leaflet-markercluster',
	'utils',
	'views/PlaceMarkerView',
	'views/UserPlaceView',
], function(Backbone, _, L, markercluster, utils, PlaceMarkerView, UserPlaceView) {
	var MapView = Backbone.View.extend({
		el : '#map-element',
		// Vi kan inte använda events-hashen eftersom den behandlas före initialize(), varför ej map:* kommer att funka
		mapEvents : {},
	
		initialize : function(options) {
			_.bindAll(this, 'render', 'panToUser', 'addPlace', 'onLoad');
			this.listenTo(this.collection, 'add', this.addPlace);
		},
		render : function() {
			this.map = L.map(this.el, {
				maxZoom : utils.maxZoom,
				zoomControl : false,
			});
			this.bindMapEvents();
			this.on('map:load', this.onLoad);
			this.map.setView([59.3219, 18.0720], 13);
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			}).addTo(this.map);
			return this;
		},
		onLoad : function() {
			this.markercluster = L.markerClusterGroup({
				maxClusterRadius : utils.maxClusterRadius,
			});
			this.map.addLayer(this.markercluster);
			this.collection.fetch({merge : true, remove : false, sort : false });
			new UserPlaceView({
				mapview : this,
			});
		},
		panTo : function(latlng) {
			this.map.panTo(latlng);
		},
		panToUser : function() {},
		zoomIn : function(val) {
			if (this.map.getZoom() < val) {
				this.map.setZoom(val);
			}
		},
		// Skapande av markör och tillägg av denna i this.markercluster sker i PlaceMarkerView::render()
		addPlace : function(model) {
			var placemarkerview = new PlaceMarkerView({
				model : model,
			});
			placemarkerview.mapview = this;
			placemarkerview.render();
		},
		filterByMaxBeerPrice : function(price) {
			this.trigger('filterByMaxBeerPrice', price);
		},
		/**
		 * Delegerar alla Leaflet-events till View-events med namn 'map:<leaflet-eventnamn>'.
		 * Binder även explicit angivna lyssnare till Leaflet-events via this.mapEvents.
		 */
		bindMapEvents : function() {
			var mapEventNames = [
				'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'contextmenu', 'focus', 
				'blur', 'preclick', 'load', 'unload', 'viewreset', 'movestart', 'move', 'moveend', 'dragstart', 'drag',
				'dragend', 'zoomstart', 'zoomend', 'zoomlevelschange', 'resize', 'autopanstart', 'layeradd', 'layerremove',
				'baselayerchange', 'overlayadd', 'overlayremove', 'locationfound', 'locationerror', 'popupopen', 'popupclose'
			];
			_.each(mapEventNames, function(mapEventName) {
				var handler = function() {
					//console.log('map:'+mapEventName);
					this.trigger('map:'+mapEventName);
				};
				handler = _.bind(handler, this);
				this.map.on(mapEventName, handler);
			}, this);
			_.each(this.mapEvents, function(handler, event) {
				handler = _.isString(handler) ? this[handler] : handler;
				if (_.isFunction(handler)) {
					handler = _.bind(handler, this);
					this.map.on(event, handler);
				}
			}, this);
		},
	});
	return MapView;
});

