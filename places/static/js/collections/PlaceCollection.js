/**
 * Används av MapView
 * Hämtning av platser initieras i MapView::initialize() (vid 'map:idle') 
 */
define([
	'backbone',
	'underscore',
	'models/Place',
], function(Backbone, _, Place) {
	var PlaceCollection = Backbone.Collection.extend({
		model : Place,
		url : 'api/places',
		
		initialize : function() {
			_.bindAll(this, 'autocomplete');
		},
		autocomplete : function(request, response) {
			var matches = [];
			var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
			this.filter(function(place) {
				var value = [place.get('name'), place.get('street_address'), place.get('city')].join(' ');
				return place.visible && matcher.test(value);
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
