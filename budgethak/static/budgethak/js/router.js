var budgethak = budgethak || {};
define([
	'backbone',
	'underscore',
	'views/AppView',
	'models/Sidebar',
	'models/Map',
	'urljs',
	'settings',
], function(Backbone, _, AppView, Sidebar, Map, Url, settings) {
	var Router = Backbone.Router.extend({
		routes : {
			'place/:slug/' : 'renderPlace',
			'info/' : 'renderInfo',
			'*default' : 'renderMap',
		},

		initialize : function() {
			var params = Url.parseQuery();
			this.params = {
				zoom : parseInt(params.zoom) || settings.defaultZoom,
				lat : parseFloat(params.lat) || settings.defaultLocation.lat,
				lng : parseFloat(params.lng) || settings.defaultLocation.lng,
			};
		},
		setUpListeners : _.once(function() {
			this.listenTo(AppView, 'user-opened-place', this.navigateToPlace);
			this.listenTo(AppView, 'user-opened-info', function() { this.navigate('info/'); });
			this.listenTo(AppView, 'user-closed-sidebar', function() { this.navigate(''); });
			this.listenTo(Map, 'change:zoom', this.setZoomParam);
			this.listenTo(Map, 'change:location', this.setLocationParams);
		}),
		renderPlace : function(slug) {
			AppView.renderPlace(slug);
			this.setUpListeners();
		},
		renderInfo : function() {
			AppView.renderInfo(this.hash);
			this.setUpListeners();
		},
		renderMap : function() {
			AppView.renderMap(this.hash);
			this.setUpListeners();
		},
 		navigate : function(fragment, options) {
			Backbone.history.navigate(fragment + '?' + Url.stringify(this.params), options);
			return this;
		},
		navigateToPlace : function(params) {
			if (params.zoom) this.setZoomParam(null, params.zoom);
			if (params.location) this.setLocationParams(null, params.location);
			this.navigate('place/'+params.id+'/');
		},
		setZoomParam : function(model, value) {
			this.params.zoom = value;
			this.updateZoomParam();
		},
		setLocationParams : function(model, value) {
			this.params.lat = value.lat;
			this.params.lng = value.lng;
			this.updateLocationParams();
		},
		updateZoomParam : function() {
			Url.updateSearchParam("zoom", this.params.zoom);
		},
		updateLocationParams : function() {
			Url.updateSearchParam("lat", this.params.lat);
			Url.updateSearchParam("lng", this.params.lng);
		},
		updateParams : function() {
			this.updateLocationParams();
			this.updateZoomParam();
		},
	});
	return new Router();
});
