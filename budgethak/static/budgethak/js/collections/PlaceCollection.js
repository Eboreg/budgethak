/**
 * Används av MapView
 */
define([
	'backbone',
	'underscore',
	'models/Place',
	'settings',
], function (Backbone, _, Place, settings) {
	var PlaceCollection = Backbone.Collection.extend({
		model: Place,
		url: 'api/places/',

		initialize: function () {
			_.bindAll(this, 'autocomplete');
			// Modeller i JSON-format, bootstrappade via Djangos IndexView
			this.reset(budgethak.bootstrap);
		},
		autocomplete: function (request, response) {
			// Returnerar aldrig fler än settings.maxAutocompleteMatches träffar.
			var matches = [];
			var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
			// Matcha först bara på namn (så att de träffarna kommer först):
			var rawMatches = this.filter(function (place) {
				return place.get('visible') && matcher.test(place.get('name'));
			});
			for (var i = 0; i < settings.maxAutocompleteMatches && i < rawMatches.length; i++) {
				matches.push({
					id: rawMatches[i].id,
					name: rawMatches[i].get('name'),
					street_address: rawMatches[i].get('street_address'),
					city: rawMatches[i].get('city'),
				});
			}
			// Sedan på fullständig adress:
			if (matches.length < settings.maxAutocompleteMatches) {
				rawMatches = this.filter(function (place) {
					var value = [place.get('street_address'), place.get('city')].join(' ');
					return place.get('visible') && matcher.test(value);
				});
				for (var i = 0; i + matches.length < settings.maxAutocompleteMatches && i < rawMatches.length; i++) {
					// Lägg bara till om platsen ej redan finns i arrayen:
					if (typeof _.find(matches, function (match) { return match.id === rawMatches[i].id; }) === "undefined") {
						matches.push({
							id: rawMatches[i].id,
							name: rawMatches[i].get('name'),
							street_address: rawMatches[i].get('street_address'),
							city: rawMatches[i].get('city'),
						});
					}
				}
			}
			response(matches);
		},
	});
	return new PlaceCollection();
});
