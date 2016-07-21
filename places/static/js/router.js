/**
 * Events som andra lyssnar på:
 * 		Backbone.'router:showMap' : AppView visar kartan 
 */
define([
	'backbone',
	'views/AppView'
], function(Backbone, App) {
	var Router = Backbone.Router.extend({
		routes : {
			'place/:slug' : 'showPlace',
			'*default' : 'showMap',
		},
		showPlace : function(slug) {
			Backbone.trigger('router:showplace');
			App.showPlace(slug);
		},
		showMap : function() {
			Backbone.trigger('router:showmap');
			App.showMap();
		},
	});
	return Router;
});