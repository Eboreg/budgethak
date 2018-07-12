define([
	'backbone',
	'leaflet',
], function(Backbone, L) {
	var Map = Backbone.Model.extend({
		defaults : {
			rendered : false,
			zoom : settings.defaultZoom,
			location : settings.defaultLocation,
			userLocation : null,
			userMarkerSet : false,
		},
	});
	return new Map();
});
