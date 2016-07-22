var sunkhak = sunkhak || {};
define([
	'backbone',
	'views/MapView',
	'collections/PlaceCollection'
], function(Backbone, MapView, PlaceCollection) {
	var Router = Backbone.Router.extend({
		routes : {
			'place/:slug' : 'showPlace',
			'*default' : 'showMap',
		},
		showPlace : function(id) {
			sunkhak.mapview = new MapView({ collection : new PlaceCollection() });
			sunkhak.mapview.renderWithPlace(id);
		},
		showMap : function() {
			sunkhak.mapview = new MapView({ collection : new PlaceCollection() });
			sunkhak.mapview.render();
		},
	});
	return Router;
});