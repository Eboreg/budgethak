import Marionette from 'backbone.marionette';
import Url from 'urljs';
import settings from './settings';
import AppView from './views/AppView';

var Controller = Marionette.MnObject.extend({
    channelName: 'controller',
    params : {
        zoom : settings.defaultZoom,
        location : {
            lat : settings.defaultLocation.lat,
            lng : settings.defaultLocation.lng,
        },
    },
    routerEvents: {
        'home': 'showHome',
        'info': 'showInfo',
        'place': 'showPlace',
    },
    
    initialize: function(options) {
        this.mergeOptions(options, ['collection', 'router', 'params', 'routerEvents']);
        var routerChannel = this.router.getChannel();
        this.bindEvents(routerChannel, this.routerEvents);
        this.appview = new AppView({
            collection: this.collection,
        });
    },
    getParams : function() {
        var params = Url.parseQuery();
        if (params.zoom) this.params.zoom = parseInt(params.zoom);
        if (params.lat) this.params.location.lat = parseFloat(params.lat);
        if (params.lng) this.params.location.lng = parseFloat(params.lng);
    },
    showHome: function() {
        this.appview.render();
    },
    renderPlace : function(slug) {
        this.getOption('appview').triggerMethod('show:place', slug);
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

});

export default Controller;
