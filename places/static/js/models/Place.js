define([
	'backbone',
], function(Backbone) {
	var Place = Backbone.Model.extend({
		idAttribute : 'slug',
		defaults : {
			visible : true,
			opened : false,
		},

		// options.maxBeerPrice == maxpris på öl
		// options.openNow == true om sådant filter ska tillämpas
		filter : function(options) {
			if (options.openNow && this.get('open_now') === false) {
				this.set("visible", false);
			} else if (options.maxBeerPrice && this.get('beer_price') > options.maxBeerPrice) {
				this.set("visible", false);
			} else {
				this.set("visible", true);
			}
		},
	});
	return Place;
});
