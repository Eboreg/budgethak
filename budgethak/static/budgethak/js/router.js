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
			this.listenTo(AppView, 'user-opened-info', function() { this.navigate('info/'); });
			this.listenTo(AppView, 'user-opened-place', function(place) { 
				this.navigate('place/'+place.id+'/'); 
			});
			this.listenTo(AppView, 'user-closed-sidebar', function() { this.navigate(''); });
			this.listenTo(Map, 'change:zoom change:location', this.setLocationParams);
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
			this.setLocationParams();
			Backbone.history.navigate(fragment + '?' + Url.stringify(this.params), options);
			return this;
		},
		toggleInfoOpen : function(sidebar, isOpen) {
			if (isOpen) {
				this.navigate('info/');
			} else {
				this.navigate('');
			}
		},
		togglePlaceOpen : function(sidebar, place) {
			if (null !== place) {
				this.navigate('place/'+place.id+'/');
			} else {
				this.navigate('');
			}
		},
		getLocationParams : function() {
			var latlng = Map.get('location');
			this.params = {
				zoom : Map.get('zoom'),
				lat : parseFloat(latlng.lat),
				lng : parseFloat(latlng.lng),
			};
		},
		setLocationParams : function() {
			this.getLocationParams();
			Url.updateSearchParam("zoom", this.params.zoom);
			Url.updateSearchParam("lat", this.params.lat);
			Url.updateSearchParam("lng", this.params.lng);
		},
	});
	return new Router();
});
