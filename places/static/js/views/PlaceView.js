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
	'views/MapView',
], function(Backbone, _, L, settings, $) {
	var PlaceView = Backbone.View.extend({
		events : {
		},
		markerEvents : {
			'click' : 'markerClicked', 
		},

		initialize : function(options) {
			_.bindAll(this, 'setActiveIcon', 'setRegularIcon');
			this.mapview = options.mapview || {};
			this.marker = new L.marker([this.model.get('lat'), this.model.get('lng')], {
				icon : settings.placeIcon,
			});
			this.bindMarkerEvents();
			this.listenTo(this.mapview, 'filter', this.filter);
//			this.listenTo(this.model, 'visible', this.visibilityChanged);
			this.listenTo(Backbone, 'place-opened', this.setActiveIcon);
			this.listenTo(Backbone, 'place-closed', this.setRegularIcon);
		},
		// Innan denna körs måste this.mapview ha satts, annars baj
		render : function() {
			this.showMarker();
			return this;
		},
		visibilityChanged : function(visible) {
			if (visible) this.showMarker();
			else this.hideMarker();
		},
		setActiveIcon : function(model) {
			if (this.model == model) {
				this.marker.setIcon(settings.placeIconActive);
			}
		},
		setRegularIcon : function(model) {
			if (this.model == model) {
				this.marker.setIcon(settings.placeIcon);
			}
		},
		showMarker : function() {
			this.mapview.markercluster.addLayer(this.marker);
			this.model.visible = true;
		},
		hideMarker : function() {
			this.mapview.markercluster.removeLayer(this.marker);
			this.model.visible = false;
		},
		// options.maxBeerPrice == maxpris på öl
		// options.openNow == true om sådant filter ska tillämpas
		filter : function(options) {
			if (options.openNow && this.model.get('open_now') === false) {
				this.hideMarker();
			} else if (options.maxBeerPrice && this.model.get('beer_price') > options.maxBeerPrice) {
				this.hideMarker();
			} else {
				this.showMarker();
			}
		},
		markerClicked : function() {
			Backbone.trigger('placeview:place-marker-clicked', this.model);
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
