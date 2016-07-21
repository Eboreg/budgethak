define([
	'backbone',
], function(Backbone) {
	var Place = Backbone.Model.extend({
		idAttribute : 'pk',
		visible : true,

		// options.maxBeerPrice == maxpris på öl
		// options.openNow == true om sådant filter ska tillämpas
		filter : function(options) {
			var oldVisible = this.visible;
			if (options.openNow && this.get('open_now') === false) {
				this.visible = false;
			} else if (options.maxBeerPrice && this.get('beer_price') > options.maxBeerPrice) {
				this.visible = false;
			} else {
				this.visible = true;
			}
			if (oldVisible !== this.visible)
				this.trigger('visible', this.visible);
		},
	});
	return Place;
});
