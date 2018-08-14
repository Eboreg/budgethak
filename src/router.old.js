var budgethak = budgethak || {};
define([
    'backbone',
    'underscore',
    'views/AppView',
    'models/Map',
    'urljs',
    'settings',
    'eventbus',
], function(Backbone, _, AppView, Map, Url, settings, EventBus) {
    var Router = Backbone.Router.extend({
        routes : {
            'place/:slug/' : 'renderPlace',
            'info/' : 'renderInfo',
            '*default' : 'renderMap',
        },
        params : {
            zoom : settings.defaultZoom,
            location : {
                lat : settings.defaultLocation.lat,
                lng : settings.defaultLocation.lng,
            },
        },

        initialize : function() {
            this.getParams();
            Url.updateSearchParam('zoom', this.params.zoom);
            Url.updateSearchParam('lat', this.params.location.lat);
            Url.updateSearchParam('lng', this.params.location.lng);
        },
        getParams : function() {
            var params = Url.parseQuery();
            if (params.zoom) this.params.zoom = parseInt(params.zoom);
            if (params.lat) this.params.location.lat = parseFloat(params.lat);
            if (params.lng) this.params.location.lng = parseFloat(params.lng);
        },
        setUpListeners : _.once(function() {
            this.listenTo(AppView, 'user-opened-place', this.navigateToPlace);
            this.listenTo(EventBus, 'user-opened-info', function() { this.navigate('info/'); });
            this.listenTo(AppView, 'user-closed-sidebar', function() { this.navigate(''); });
            this.listenTo(Map, 'change:zoom', this.updateZoomParam);
            this.listenTo(Map, 'change:location', this.updateLocationParams);
        }),
        renderPlace : function(slug) {
            AppView.renderPlace(slug);
            this.setUpListeners();
        },
        renderInfo : function() {
            this.getParams();
            AppView.renderInfo(this.params);
            this.setUpListeners();
        },
        renderMap : function() {
            this.getParams();
            AppView.renderMap(this.params);
            this.setUpListeners();
        },
        navigate : function(fragment, options) {
            var params = {
                zoom : this.params.zoom,
                lat : this.params.location.lat,
                lng : this.params.location.lng,
            };
            Backbone.history.navigate(fragment + '?' + Url.stringify(params), options);
            return this;
        },
        navigateToPlace : function(params) {
            if (params.zoom) this.params.zoom = params.zoom;
            if (params.location) this.params.location = params.location;
            this.navigate('place/'+params.id+'/');
        },
        updateZoomParam : function(model, value) {
            this.params.zoom = value;
            Url.updateSearchParam('zoom', this.params.zoom);
        },
        updateLocationParams : function(model, value) {
            this.params.location = value;
            Url.updateSearchParam('lat', this.params.location.lat);
            Url.updateSearchParam('lng', this.params.location.lng);
        },
    });
    return new Router();
});
