define([
	'backbone',
	'leaflet',
], function(Backbone, L) {
	var Map = Backbone.Model.extend({
		defaults : {
			rendered : false,
			zoom : 13,
			location : { lat : 59.3219, lng : 18.0720 },
			userLocation : null,
			userMarkerSet : false,
		},
	});
	return Map;
});
