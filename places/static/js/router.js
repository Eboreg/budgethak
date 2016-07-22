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
		showPlace : function(slug) {
			Backbone.trigger('router:showplace');
			sunkhak.mapview = new MapView({ collection : new PlaceCollection() });
			sunkhak.mapview.showPlace(slug);
		},
		showMap : function() {
			Backbone.trigger('router:showmap');
			sunkhak.mapview = new MapView({ collection : new PlaceCollection() });
			sunkhak.mapview.render();
		},
	});
	return Router;
});