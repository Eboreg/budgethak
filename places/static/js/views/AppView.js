// Av debug-skäl:
var sunkhak = sunkhak || {};
define([
	'backbone',
	'views/MapView',
	'models/Place',
	'collections/PlaceCollection',
], function(Backbone, MapView, Place, PlaceCollection) {
	var AppView = Backbone.View.extend({
		el: '#app',
		
		initialize : function() {
		},
		showMap : function() {
			if (!this.mapview) {
				this.mapview = sunkhak.mapview = new MapView({ collection : new PlaceCollection() });
				this.mapview.render();
			}
		},
		showPlace : function(slug) {
			this.showMap();
			console.log(slug);
		},
	});
	sunkhak.appview = new AppView();
	return sunkhak.appview;
});
