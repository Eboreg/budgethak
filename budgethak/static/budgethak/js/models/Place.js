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

		oh_equals : function(oh1, oh2) {
			return (oh1.opening_time == oh2.opening_time && oh1.closing_time == oh2.closing_time && oh1.closed_entire_day == oh2.closed_entire_day);
		},

		groupOpeningHours : function() {
			var oh = this.get("opening_hours");
			var oh_grouped = [];
			for (var i = 0; i < oh.length; i++) {
				if (0 == i || !this.oh_equals(oh[i-1], oh[i])) {
					oh_grouped.push({
						start_weekday : oh[i].weekday,
						end_weekday : oh[i].weekday,
						opening_time : oh[i].opening_time,
						closing_time : oh[i].closing_time,
						closed_entire_day : oh[i].closed_entire_day,
					});
				} else {
					// Denna dags öppettider == föregående dags; gruppera dem
					oh_grouped[oh_grouped.length-1].end_weekday = oh[i].weekday;
				}
			}
			return oh_grouped;
		},

		toJSONGrouped : function() {
			var json = this.toJSON();
			json.opening_hours = this.groupOpeningHours();
			return json;
		},
	});
	return Place;
});
