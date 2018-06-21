define([
	'backbone',
], function(Backbone) {
	var Place = Backbone.Model.extend({
		idAttribute : 'slug',
		defaults : {
			visible : true,
			opened : false,
		},
		
		url : function() {
			// Fix för trasiga REST-requests (utan trailing slash)
			var origUrl = Backbone.Model.prototype.url.call(this);
			return origUrl + (origUrl.charAt(origUrl.length - 1) == '/' ? '' : '/');
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
