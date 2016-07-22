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
	var PlaceView = Backbone.View.extend({
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
			this.listenTo(this.mapview, 'showplace:'+this.model.id, this.openPopup);
//			this.listenTo(this.model, 'visible', this.visibilityChanged);
			this.marker = new L.marker([this.model.get('lat'), this.model.get('lng')], {
				icon : utils.placeIcon,
			});
			this.bindMarkerEvents();
			this.showMarker();
			this.trigger("render", this.model.id);
			return this;
		},
		visibilityChanged : function(visible) {
			if (visible) this.showMarker();
			else this.hideMarker();
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
//	   				autoPanPaddingTopLeft : [10, $("#menu-bar-container").outerHeight(true) + 5],
	   				autoPanPaddingTopLeft : [10, utils.popupTop],
	   				autoPanPaddingBottomRight : [10, 10],
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
					e.data.that.setPopupImageSize();
					e.data.that.refreshPopup();
		    		e.data.that.marker.openPopup();
				});
				$(window).resize({ that : this }, function(e) {
					e.data.that.setPopupImageSize();
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
		setPopupImageSize : function() {
			if (this.$popupImage) {
				var ratio = this.$popupImage[0].width / this.$popupImage[0].height;
				var maxwidth = $(window).width() * 0.75;
				var maxheight = $(window).height() * 0.4;
				this.$popupImage.width(utils.popupImageWidth);
				if (maxwidth > maxheight * ratio) {
					this.$popupImage.css("max-height", $(window).height() * 0.4);
					this.$popupImage.width("auto");
				} else {
					this.$popupImage.css("max-width", $(window).width() * 0.75);
					this.$popupImage.height("auto");
				}
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
	return PlaceView;
});
