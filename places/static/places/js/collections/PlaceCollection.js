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
			this.reset(budgethak.bootstrap);
		},
		autocomplete : function(request, response) {
			var matches = [];
			var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
			// Matcha först bara på namn (så att de träffarna kommer först):
			this.filter(function(place) {
				return place.get('visible') && matcher.test(place.get('name'));
			}).forEach(function(place) {
				matches.push({ id : place.id, 
					name : place.get('name'), 
					street_address : place.get('street_address'), 
					city : place.get('city')
				});
			});
			// Sedan på fullständig adress:
			this.filter(function(place) {
				var value = [place.get('street_address'), place.get('city')].join(' ');
				return place.get('visible') && matcher.test(value);
			}).forEach(function(place) {
				// Lägg bara till om platsen ej redan finns i arrayen:
				if (typeof _.find(matches, function(match) { return match.id === place.id; }) === "undefined") {
					matches.push({ id : place.id, 
						name : place.get('name'), 
						street_address : place.get('street_address'), 
						city : place.get('city')
					});
				}
			});
			response(matches);
		},
	});
	return PlaceCollection;
});
