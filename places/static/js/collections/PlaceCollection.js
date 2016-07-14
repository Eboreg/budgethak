/**
 * Används av MapView
 * Hämtning av platser initieras i MapView::initialize() (vid 'map:idle') 
 */
define([
	'backbone',
	'underscore',
	'models/Place',
	'views/MapView',
], function(Backbone, _, Place) {
	var PlaceCollection = Backbone.Collection.extend({
		model : Place,
		url : 'api/places',
	});
	return PlaceCollection;
});
