var sunkhak = sunkhak || {};
define([
	'backbone',
	'urljs',
	'views/AppView',
], function(Backbone, Url) {
	var Router = Backbone.Router.extend({
		routes : {
			'place/:id' : 'renderPlace',
			'info' : 'renderInfo',
			'*default' : 'renderMap',
		},
		hash : Url.hash(),

		initialize : function() {
			Url.removeHash(false);
			console.log(Url.parseQuery());
		},
		renderPlace : function(id) {
			sunkhak.appview.renderPlace(id);
		},
		renderInfo : function() {
			sunkhak.appview.renderInfo(this.hash);
		},
		renderMap : function() {
			sunkhak.appview.renderMap(this.hash);
		},
	});
	return Router;
});