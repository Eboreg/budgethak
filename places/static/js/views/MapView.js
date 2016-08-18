/**
 * Vyn har direkt kännedom om modellen då det ej finns anledning att ha någon Collection (vi använder bara en karta).
 * Förändringar i geolocation räknas som en användarinteraktion och tas omhand här.
 * 
 * Properties
 * el : kartelementet
 * model : sunkhak.Map (används ännu bara för att ange defaultvärden; kan ej hämta eller lagra några data någonstans)
 * map : 
 * mapEvents : lyssnar efter events på 'map'
 * 
 * Events:
 * 	Backbone.'mapview:map:idle' : UserPlaceView ritar ut användarmarkör (om position finns)
 */
define([
	'backbone',
	'underscore',
	'leaflet',
	'leaflet-markercluster',
	'settings',
	'models/Map',
	'urljs',
	'leaflet-usermarker',
], function(Backbone, _, L, markercluster, settings, Map, Url) {
	var MapView = Backbone.View.extend({
		id : 'map-element',
		// Vi kan inte använda events-hashen eftersom den behandlas före initialize(), varför ej map:* kommer att funka
		mapEvents : {
			'load' : 'onMapReady',
			'click' : 'onMapClick',
			'zoomend' : 'onMapZoomEnd',
			'moveend' : 'onMapMoveEnd',
			'locationfound' : 'onMapLocationFound',
		},
	
		initialize : function() {
			this.model = new Map();
			this.listenTo(this.model, 'change:userLocation', this.onUserLocationChange);
			this.listenTo(this.model, 'change:zoom change:location', this.onMapViewportChange);
			this.markercluster = L.markerClusterGroup({
				maxClusterRadius : settings.maxClusterRadius,
			});
		},
		render : function() {
			if (!this.model.get('rendered')) {
				this.map = L.map(this.el, {
					maxZoom : settings.maxZoom,
					zoomControl : false,
					attributionControl : false,
				});
				this.bindMapEvents();
				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(this.map);
				L.control.attribution({
					position : 'bottomleft',
				}).addAttribution('Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>')
					.addTo(this.map);
				// Triggar map:load som kör this.onMapReady():
				this.map.setView(this.model.get('location'), this.model.get('zoom'));
			}
			return this;
		},
		reloadMapSize : function() {
			var reloadFunc = _.bind(function() {
				this.map.invalidateSize({ pan : false });
			}, this);
			if (!this.model.get('rendered')) {
				this.listenToOnce(this.model, 'change:rendered', function() {
					reloadFunc();
				});
			} else {
				reloadFunc();
			}
		},
		// fullZoom = bool
		flyTo : function(latlng, fullZoom) {
			fullZoom = fullZoom || false;
			if (!fullZoom)
				this.map.flyTo(latlng);
			else
				this.map.flyTo(latlng, 17);
		},
		panToIfOutOfBounds : function(latlng) {
			try {
				var bounds = this.map.getBounds();
				if (!bounds.contains(latlng)) {
					this.map.panTo(latlng);
				}
			} catch(e) {}
		},
		zoomInFull : function() {
			this.map.setZoom(settings.maxZoom);
		},
		// Triggas av ikonklick i MenuBarView
		gotoUserLocation : function() {
			// Vi söker efter användarens plats först när denne aktivt ber om det.
			// När den hittas, triggar kartan "locationfound"-event.
			if (null === this.model.get('userLocation')) {
				this.map.locate({
					watch : true,
					locate : true,
					setView : false,
					maxZoom : 15,
					enableHighAccuracy : true,
				});
			} else {
				this.map.flyTo(this.model.get('userLocation').latlng, 17);
			}
		},
		addMarker : function(marker) {
			var func = _.bind(function() {
				this.map.addLayer(marker);
			}, this);
			if (this.model.get('rendered')) {
				func();
			} else {
				this.listenTo(this.model, 'change:rendered', func);
			}
		},
		removeMarker : function(marker) {
			var func = _.bind(function() {
				this.map.removeLayer(marker);
			}, this);
			if (this.model.get('rendered')) {
				func();
			} else {
				this.listenTo(this.model, 'change:rendered', func);
			}
		},

		// KART-EVENTS
		// Triggas av load-event från map 
		// Körs alltså alltid efter this.render()
		onMapReady : function() {
			this.map.addLayer(this.markercluster);
			this.model.set('rendered', true);
		},
		onMapMoveEnd : function() {
			this.model.set('location', this.map.getCenter());
		},
		onMapZoomEnd : function() {
			this.model.set('zoom', this.map.getZoom());
		},
		onMapLocationFound : function(location) {
			this.model.set('userLocation', location);
			this.trigger('map-location-found', location);
		},

		// DOM-EVENTS
		// Klickat någonstans på kartan men ej på en marker
		onMapClick : function() {
			this.trigger('map-click');
		},

		// MODELL-EVENTS
		onUserLocationChange : function(model, value) {
			if (!this.userMarker) {
				this.userMarker = L.userMarker(value.latlng, {
					smallIcon : true,
				}).addTo(this.map);
				this.map.flyTo(value.latlng, 17);
				this.model.set("userMarkerSet", true);
			}
			this.userMarker.setLatLng(value.latlng);
			this.userMarker.setAccuracy(value.accuracy);
		},
		onMapViewportChange : function() {
			this.trigger('map-viewport-change');
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

