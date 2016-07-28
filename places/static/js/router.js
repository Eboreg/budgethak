var sunkhak = sunkhak || {};
define([
	'backbone',
	'views/AppView',
], function(Backbone) {
	var Router = Backbone.Router.extend({
		routes : {
			'place/:id' : 'showPlace',
			'info' : 'showInfo',
			'*default' : 'showMap',
		},

		showPlace : function(id) {
			sunkhak.appview.showPlace(id);
		},
		showInfo : function() {
			sunkhak.appview.showInfo();
		},
		showMap : function() {
			sunkhak.appview.showMap();
		},
	});
	return Router;
});