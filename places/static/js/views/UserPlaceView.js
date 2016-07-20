/**
 * Properties:
 * 'model' : dopin.UserPlace()
 * 'mapview' : MapView-objektet
 * 'icon' : "Min position"-plupp ('shadow' är deprecated!)
 * Events:
 * 'moved' : när positionen ändrats (även när den första gången ritas ut)
 */
define([
	'backbone',
	'underscore',
	'leaflet',
	'views/MapView',
	'leaflet-usermarker',
], function(Backbone, _, L) {
	var UserPlaceView = Backbone.View.extend({
		initialize : function(options) {
			this.mapview = options.mapview || {};
			// Första gången man klickar, börjar vi söka efter position:
			this.listenToOnce(this.mapview, 'goto-my-position-clicked', function() {
				// Denna kommer att triggas varje gång en ny position är funnen:
				this.mapview.map.on("locationfound", function(location) {
					if (!this.marker) {
						this.marker = L.userMarker(location.latlng, {
							smallIcon : true,
						}).addTo(this.mapview.map);
						this.mapview.map.flyTo(location.latlng, 17);
					}
					this.marker.setLatLng(location.latlng);
					this.marker.setAccuracy(location.accuracy);
					// Spola ev. lyssning på gammal position och lägg till ny:
					this.stopListening(this.mapview, 'goto-my-position-clicked');
					this.listenTo(this.mapview, 'goto-my-position-clicked', function() {
						this.mapview.map.flyTo(location.latlng, 17);
					});
				}, this);
				this.mapview.map.locate({
					watch : true,
					locate : true,
					setView : false,
					maxZoom : 15,
					enableHighAccuracy : true,
				});
			});
		},
		/**
		 * err = PositionError https://developer.mozilla.org/en-US/docs/Web/API/PositionError
		 * Funkar ej nu, kanske ska göras om senare....
		 */ 
		showError : function(err) {
			if (err && err.code) {
				switch (err.code) {
					case err.PERMISSION_DENIED:
						notification.error("Tilläts inte hämta position!");
						break;
					case err.POSITION_UNAVAILABLE:
						notification.error("Kunde inte avgöra din position!");
						break;
					case err.TIMEOUT:
						notification.error("Timeout vid hämtning av position!");
						break;
					default:
						notification.error("Okänt fel inträffade vid avläsning av din position.");
				}
			}
			else {
				notification.error("Okänt fel inträffade vid avläsning av din position.");
			}
		},

		/**
		 * Delegerar valda Google Maps-events till View-events med namn 'marker:<gmaps-eventnamn>'.
		 * Binder även explicit angivna lyssnare till Google Maps-events via this.markerEvents.
		 * Ska kanske göras om senare....
		 */
		bindMarkerEvents : function() {
			var markerEventNames = ['click', 'dblclick', 'dragend'];
			_.each(markerEventNames, function(markerEventName) {
				var handler = function() {
					this.trigger('marker:'+markerEventName);
				};
				handler = _.bind(handler, this);
				google.maps.event.addListener(this.marker, markerEventName, handler);
			}, this);
			_.each(this.markerEvents, function(handler, event) {
				handler = _.isString(handler) ? this[handler] : handler;
				if (_.isFunction(handler)) {
					handler = _.bind(handler, this);
					google.maps.event.addListener(this.marker, event, handler);
				}
			}, this);
		},
	});
	return UserPlaceView;
});
