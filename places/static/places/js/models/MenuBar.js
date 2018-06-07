define([
	'backbone',
], function(Backbone) {
	var MenuBar = Backbone.Model.extend({
		defaults : {
			infoActive : false,
			mobileMenuOpen : false,
			maxBeerPrice : 40,
			filterClosedPlaces : false,
		},
	});
	return MenuBar;
});
