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
			console.log('Router::showPlace()', slug);
			Backbone.trigger('router:showplace');
			//App.showCafe(slug);
		},
		showMap : function() {
			console.log('Router::showMap()');
			Backbone.trigger('router:showmap');
			App.showMap();
		},
	});
	return Router;
});