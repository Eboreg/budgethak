var budgethak = budgethak || {};
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
		},
		renderPlace : function(id) {
			budgethak.appview.renderPlace(id);
		},
		renderInfo : function() {
			budgethak.appview.renderInfo(this.hash);
		},
		renderMap : function() {
			budgethak.appview.renderMap(this.hash);
		},
	});
	return Router;
});