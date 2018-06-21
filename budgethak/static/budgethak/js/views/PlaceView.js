/**
 * Agerar både view åt en Place-modell och under-view åt MapView.
 * this.model : Place
 * Klassen instansieras i MapView::addMarker().
 */
define([
	'backbone',
	'underscore',
	'leaflet',
	'settings',
	'models/Place',
], function(Backbone, _, L, settings) {
	var PlaceView = Backbone.View.extend({
		markerEvents : {
			'click' : 'onMarkerClick', 
		},

		initialize : function() {
			this.marker = new L.marker([this.model.get('lat'), this.model.get('lng')], {
				icon : (this.model.get('opened') ? settings.placeIconActive : settings.placeIcon),
			});
			// Måste lyssna på events här eftersom events-hashen körs FÖRE initialize()
			this.bindMarkerEvents();
			this.listenTo(this.model, 'change:opened', this.toggleOpened);
			this.listenTo(this.model, 'change:visible', this.toggleVisible);
		},

		/* MODELL-EVENTS */
		toggleVisible : function(model, value) {
			if (value)
				this.markercluster.addLayer(this.marker);
			else {
				this.markercluster.removeLayer(this.marker);
				this.mapview.removeMarker(this.marker);
			}
		},
		toggleOpened : function(model, value) {
			if (value) {
				this.marker.setIcon(settings.placeIconActive);
				if (this.markercluster.hasLayer(this.marker)) {
					this.markercluster.removeLayer(this.marker);
					this.mapview.addMarker(this.marker);
				}
				this.marker.setZIndexOffset(1000);
			} else {
				this.marker.setIcon(settings.placeIcon);
				if (this.markercluster.hasLayer(this.marker)) {
					this.mapview.removeMarker(this.marker);
					this.markercluster.addLayer(this.marker);
				}
				this.marker.setZIndexOffset(0);
			}
		},

		/* DOM-EVENTS */
		onMarkerClick : function() {
			this.model.set('opened', !this.model.get('opened'));
			this.trigger('marker-click', this.model);
		},

	    /**
		 * Delegerar valda Leaflet-events till View-events med namn 'marker:<leaflet-eventnamn>'.
		 * Binder även explicit angivna lyssnare till Leaflet-events via this.markerEvents.
		 */
		bindMarkerEvents : function() {
			var markerEventNames = [
				'click', 'dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu', 'dragstart', 'drag', 'dragend',
				'move', 'add', 'remove', 'popupopen', 'popupclose'
			];
			_.each(markerEventNames, function(markerEventName) {
				var handler = function() {
					this.trigger('marker:'+markerEventName);
				};
				handler = _.bind(handler, this);
				this.marker.on(markerEventName, handler);
			}, this);
			_.each(this.markerEvents, function(handler, event) {
				handler = _.isString(handler) ? this[handler] : handler;
				if (_.isFunction(handler)) {
					handler = _.bind(handler, this);
					this.marker.on(event, handler);
				}
			}, this);
		},
	});
	return PlaceView;
});
