define([
	'backbone',
], function(Backbone) {
	var Map = Backbone.Model.extend({
		defaults : {
			rendered : false,
			zoom : 13,
			location : [59.3219, 18.0720],
			userLocation : null,
		},
	});
	return Map;
});
