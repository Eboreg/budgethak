define([
	'backbone',
], function(Backbone) {
	var Place = Backbone.Model.extend({
		idAttribute : 'slug',
		defaults : {
			visible : true,
			opened : false,
			zIndex : 0,
		},
		
		url : function() {
			var origUrl = Backbone.Model.prototype.url.call(this);
			return origUrl + (origUrl.charAt(origUrl.length - 1) == '/' ? '' : '/');
		},
		
		initialize : function() {
			this.on('change:opened', function(model, value) {
				if (value)
					this.set('zIndex', 1000);
				else
					this.set('zIndex', 0);
			});
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
