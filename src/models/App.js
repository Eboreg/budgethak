define([
	'backbone',
], function(Backbone) {
	var App = Backbone.Model.extend({
		defaults : {
			filterClosedPlaces : false,
			maxBeerPrice : 40,
		},
	});
	return new App();
});
