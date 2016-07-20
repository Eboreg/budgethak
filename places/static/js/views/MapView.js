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
		mapEvents : {
			'load' : 'onLoad'
		},
	
		initialize : function(options) {
			_.bindAll(this, 'render', 'addPlace', 'onLoad', 'cron30min', 'gotoMyPositionClicked');
			this.listenTo(this.collection, 'add', this.addPlace);
		},
		render : function() {
			this.map = L.map(this.el, {
				maxZoom : utils.maxZoom,
				zoomControl : false,
			});
			this.bindMapEvents();
			this.map.setView([59.3219, 18.0720], 13);
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			}).addTo(this.map);
			this.menuBar = L.control({
				position : 'topleft',
			});
			this.menuBar.onAdd = function(map) {
				var template = _.template($("#menuBar").html());
				return $(template())[0];
			};
			this.menuBar.addTo(this.map);
			$("#my-location-icon").click(this.gotoMyPositionClicked);
			window.setInterval(this.cron30min, 60000);
			return this;
		},
		gotoMyPositionClicked: function() {
			this.trigger("goto-my-position-clicked");
		},
		onLoad : function() {
			this.markercluster = L.markerClusterGroup({
				maxClusterRadius : utils.maxClusterRadius,
			});
			this.map.addLayer(this.markercluster);
			this.collection.fetch();
			new UserPlaceView({
				mapview : this,
			});
		},
		panTo : function(latlng) {
			this.map.panTo(latlng);
		},
		// Skapande av markör och tillägg av denna i this.markercluster sker i PlaceMarkerView::render()
		addPlace : function(model) {
			var placemarkerview = new PlaceMarkerView({
				model : model,
				mapview : this,
			});
			placemarkerview.render();
		},
		// openNow == true om sådant filter ska tillämpas
		filter : function(maxBeerPrice, openNow) {
			maxBeerPrice = maxBeerPrice || 40;
			openNow = openNow || false;
			this.trigger('filter', maxBeerPrice, openNow);
		},
		cron30min : function() {
			var d = new Date();
			if (d.getMinutes() % 30 === 0) {
				this.collection.fetch();
			}
		},
		/**		/**
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

