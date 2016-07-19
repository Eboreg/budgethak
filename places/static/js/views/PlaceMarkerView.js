/**
 * Agerar både view åt en Place-modell och under-view åt MapView.
 * this.model : Place
 * Klassen instansieras i MapView::addMarker().
 * Events som kan triggas:
 * 	'remove' -> ta bort markören, lyssnas av MapView 
 */
define([
	'backbone',
	'underscore',
	'leaflet',
	'utils',
	'jquery',
	'models/Place',
], function(Backbone, _, L, utils, $) {
	var PlaceMarkerView = Backbone.View.extend({
		events : {
		},
		markerEvents : {
			'click' : 'openInfoWindow', 
		},
		infoWindowEvents : {
			'remove' : 'removeInfoWindow', 
		},
		infoWindowIsOpen : false,

		initialize : function() {
			this.listenTo(this.model, 'remove', this.clear);
		},	
		// Innan denna körs måste this.mapview ha satts av MapView, annars baj
		render : function() {
			this.listenTo(this.mapview, 'filterByMaxBeerPrice', this.filterByMaxBeerPrice);
			this.marker = new L.marker([this.model.get('lat'), this.model.get('lng')], {
				icon : utils.placeIcon,
			});
			this.bindMarkerEvents();
			this.showMarker();
		},
		showMarker : function() {
			this.mapview.markercluster.addLayer(this.marker);
		},
		hideMarker : function() {
			this.mapview.markercluster.removeLayer(this.marker);
		},
		filterByMaxBeerPrice : function(price) {
			if (this.model.get('beer_price') > price) {
				this.hideMarker();
			} else {
				this.showMarker();
			}
		},
		/**
		 * Ritar om markören. Körs när något i modellen ändrats (typiskt sett openNow).
		 */
		redraw : function() {
			this.marker.setOptions(this.getMarkerOptions());
		},
		clear : function() {
			this.trigger('remove');
			this.remove();
		},
	    
	    /**
	     * INFOWINDOW
	     */
	    openInfoWindow : function(e) {
			if (!this.infoWindow) {
				this.infoWindowTemplate = _.template($("#placeInfoWindowText").html());
	   			this.infoWindow = new L.popup({
	   				//maxWidth : "auto",
	   				maxWidth : utils.infoWindowImageWidth + 40,
	   				autoClose : true,
	   				autoPan : true,
	   			}).setContent('Hämtar data ...');
	    		this.bindInfoWindowEvents();
	    		this.listenTo(this.model, 'change', this.updateInfoWindow);
	    		this.model.fetch();
		    	this.marker.bindPopup(this.infoWindow);
			}
			this.infoWindowIsOpen = true;
	    },
	    updateInfoWindow : function() {
			var $content = $("<div />");
			$content.html(this.infoWindowTemplate(this.model.toJSON()));
			// När bilden laddats in i DOM måste popupen uppdateras
			if (this.model.get('image') != '') {
				this.$infoWindowImage = $content.find(".info-window-image");
				this.$infoWindowImage.on('load', { that : this }, function(e) {
					e.data.that.setInfoWindowImageWidth();
					e.data.that.refreshInfoWindow();
		    		e.data.that.marker.openPopup();
				});
				$(window).resize({ that : this }, function(e) {
					e.data.that.setInfoWindowImageWidth();
					e.data.that.refreshInfoWindow();
				});
			} else {
	    		this.marker.openPopup();
			}
			this.infoWindow.setContent($content[0]);
			//this.refreshInfoWindow();
	    },
		refreshInfoWindow : function() {
			if (this.infoWindowIsOpen) {
				this.infoWindow.update();
//				this.marker.openPopup();
			}
		},
		setInfoWindowImageWidth : function() {
			if (this.$infoWindowImage) {
				this.$infoWindowImage.width(utils.infoWindowImageWidth);
				this.$infoWindowImage.css("max-width", $(window).width() * 0.75);
			}
		},
		removeInfoWindow : function() {
			delete this.$infoWindowImage;
			this.infoWindowIsOpen = false;
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
		 * Delegerar valda Leaflet-events till View-events med namn 'infoWindow:<leaflet-eventnamn>'.
		 * Binder även explicit angivna lyssnare till Leaflet-events via this.infoWindowEvents.
		 */
		bindInfoWindowEvents : function() {
			var infoWindowEventNames = ['add', 'remove', 'popupopen', 'popupclose'];
			_.each(infoWindowEventNames, function(infoWindowEventName) {
				var handler = function() {
					console.log('infoWindow:'+infoWindowEventName);
					this.trigger('infoWindow:'+infoWindowEventName);
				};
				handler = _.bind(handler, this);
				this.infoWindow.on(infoWindowEventName, handler);
			}, this);
			_.each(this.infoWindowEvents, function(handler, event) {
				handler = _.isString(handler) ? this[handler] : handler;
				if (_.isFunction(handler)) {
					handler = _.bind(handler, this);
					this.infoWindow.on(event, handler);
				}
			}, this);
		},
	});
	return PlaceMarkerView;
});
