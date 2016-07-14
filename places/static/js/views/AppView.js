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
			console.log('AppView::showMap()');
			if (!this.mapview) {
				this.mapview = sunkhak.mapview = new MapView({ collection : new PlaceCollection() });
				this.mapview.render();
			}
/*
			if (!this.userplaceview) {
				this.userplaceview = new UserPlaceView({ model : userplace, mapview : this.mapview });
			}
			this.$("#map-element").show();
			this.$("#cafe-element").hide();
*/
		},
/*
		showCafe : function(slug) {
			this.cafe = new Cafe();
			this.cafe.url = 'api/cafes/'+slug;
			this.cafe.fetch();
			this.cafeview = new CafeView({ model : this.cafe });
			this.$("#cafe-element").show();
			this.$("#map-element").hide();
		},
*/
	});
	sunkhak.appview = new AppView();
	return sunkhak.appview;
});
