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
	'jquery',
	'models/Place',
], function(Backbone, _, L, settings, $) {
	var PlaceView = Backbone.View.extend({
		markerEvents : {
			'click' : 'onMarkerClick', 
		},

		initialize : function() {
			this.marker = new L.marker([this.model.get('lat'), this.model.get('lng')], {
				icon : settings.placeIcon,
			});
			this.bindMarkerEvents();
			this.listenTo(this.model, 'change:opened', this.onOpenedChange);
			this.listenTo(this.model, 'change:zIndex', this.onZIndexChange);
		},

		/* MODELL-EVENTS */
		onOpenedChange : function(model, value) {
			if (value) {
				this.marker.setIcon(settings.placeIconActive);
			} else {
				this.marker.setIcon(settings.placeIcon);
			}
		},
		onZIndexChange : function(model, value) {
			this.marker.setZIndexOffset(value);
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
