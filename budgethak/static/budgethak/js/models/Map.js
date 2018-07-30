define([
	'backbone',
	'settings',
], function(Backbone, settings) {
	var Map = Backbone.Model.extend({
		defaults : {
			rendered : false,
			zoom : settings.defaultZoom,
			location : settings.defaultLocation,
			userLocation : null,
			userMarkerSet : false,
			name : 'Map',
		},
	});
	return new Map();
});
