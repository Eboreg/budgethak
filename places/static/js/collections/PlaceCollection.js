/**
 * Används av MapView
 */
define([
	'backbone',
	'underscore',
	'models/Place',
], function(Backbone, _, Place) {
	var PlaceCollection = Backbone.Collection.extend({
		model : Place,
		url : 'api/places/',
		
		initialize : function() {
			_.bindAll(this, 'autocomplete');
			// Modeller i JSON-format, bootstrappade via Djangos IndexView
			this.reset(sunkhak.bootstrap);
		},
		autocomplete : function(request, response) {
			var matches = [];
			var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
			this.filter(function(place) {
				var value = [place.get('name'), place.get('street_address'), place.get('city')].join(' ');
				return place.get('visible') && matcher.test(value);
			}).forEach(function(place) {
				matches.push({ id : place.id, 
					name : place.get('name'), 
					street_address : place.get('street_address'), 
					city : place.get('city')
				});
			});
			response(matches);
		},
	});
	return PlaceCollection;
});
