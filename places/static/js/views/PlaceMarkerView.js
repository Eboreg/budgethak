/**
 * Agerar både view åt en Place-modell och under-view åt MapView.
 * this.model : Place
 * Klassen instansieras i MapView::addMarker().
 */
define([
	'backbone',
	'underscore',
	'leaflet',
	'utils',
	'jquery',
	'models/Place',
	'views/MapView',
], function(Backbone, _, L, utils, $) {
	var PlaceMarkerView = Backbone.View.extend({
		events : {
		},
		markerEvents : {
			'click' : 'openPopup', 
		},
		popupEvents : {
			'remove' : 'removePopup', 
		},
		popupIsOpen : false,

		initialize : function(options) {
			this.mapview = options.mapview || {};
		},
		// Innan denna körs måste this.mapview ha satts, annars baj
		render : function() {
			this.listenTo(this.mapview, 'filter', this.filter);
			this.marker = new L.marker([this.model.get('lat'), this.model.get('lng')], {
				icon : utils.placeIcon,
			});
			this.bindMarkerEvents();
			this.showMarker();
			return this;
		},
		showMarker : function() {
			this.mapview.markercluster.addLayer(this.marker);
		},
		hideMarker : function() {
			this.mapview.markercluster.removeLayer(this.marker);
		},
		filter : function(maxBeerPrice, openNow) {
			if ((openNow && this.model.get('open_now') === false) || this.model.get('beer_price') > maxBeerPrice) {
				this.hideMarker();
			} else {
				this.showMarker();
			}
		},
	    
	    /**
	     * POPUP
	     */
	    openPopup : function(e) {
			if (!this.popup) {
				this.popupTemplate = _.template($("#placePopupText").html());
	   			this.popup = new L.popup({
	   				//maxWidth : "auto",
	   				maxWidth : utils.popupImageWidth + 40,
	   				autoClose : true,
	   				autoPan : true,
	   			}).setContent('Hämtar data ...');
	    		this.bindPopupEvents();
	    		this.listenTo(this.model, 'change', this.updatePopup);
	    		this.model.fetch();
		    	this.marker.bindPopup(this.popup);
			}
			this.popupIsOpen = true;
	    },
	    updatePopup : function() {
			var $content = $("<div />");
			$content.html(this.popupTemplate(this.model.toJSON()));
			// När bilden laddats in i DOM måste popupen uppdateras
			if (this.model.get('image') != '') {
				this.$popupImage = $content.find(".place-popup-image");
				this.$popupImage.on('load', { that : this }, function(e) {
					e.data.that.setPopupImageWidth();
					e.data.that.refreshPopup();
		    		e.data.that.marker.openPopup();
				});
				$(window).resize({ that : this }, function(e) {
					e.data.that.setPopupImageWidth();
					e.data.that.refreshPopup();
				});
			} else {
	    		this.marker.openPopup();
			}
			this.popup.setContent($content[0]);
	    },
		refreshPopup : function() {
			if (this.popupIsOpen) {
				this.popup.update();
			}
		},
		setPopupImageWidth : function() {
			if (this.$popupImage) {
				this.$popupImage.width(utils.popupImageWidth);
				this.$popupImage.css("max-width", $(window).width() * 0.75);
			}
		},
		removePopup : function() {
			delete this.$popupImage;
			this.popupIsOpen = false;
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
					//this.marker.off(event);
					this.marker.on(event, handler);
				}
			}, this);
		},
	    
	    /**
		 * Delegerar valda Leaflet-events till View-events med namn 'popup:<leaflet-eventnamn>'.
		 * Binder även explicit angivna lyssnare till Leaflet-events via this.popupEvents.
		 */
		bindPopupEvents : function() {
			var popupEventNames = ['add', 'remove', 'popupopen', 'popupclose'];
			_.each(popupEventNames, function(popupEventName) {
				var handler = function() {
					console.log('popup:'+popupEventName);
					this.trigger('popup:'+popupEventName);
				};
				handler = _.bind(handler, this);
				this.popup.on(popupEventName, handler);
			}, this);
			_.each(this.popupEvents, function(handler, event) {
				handler = _.isString(handler) ? this[handler] : handler;
				if (_.isFunction(handler)) {
					handler = _.bind(handler, this);
					this.popup.on(event, handler);
				}
			}, this);
		},
	});
	return PlaceMarkerView;
});
