import Marionette from 'backbone.marionette';
import Url from 'urljs';
import settings from './settings';
import AppView from './views/AppView';
import PlaceCollection from './collections/PlaceCollection';

var Controller = Marionette.MnObject.extend({
    channelName: 'controller',
    params : {
        zoom : settings.defaultZoom,
        location : {
            lat : settings.defaultLocation.lat,
            lng : settings.defaultLocation.lng,
        },
    },
    
    initialize: function() {
        var initialData = this.getOption('initialData');
        this.options.appview = new AppView({
            collection: new PlaceCollection(initialData.places),
        });
        this.options.appview.render();
        // this.options.regionManager = new Marionette.RegionManager({
        //     regions: {
        //         app: '#app',
        //     },
        // });
        // var initialData = this.getOption('initialData');
        // var appview = new AppView({
        //     collection: new PlaceCollection(initialData.places),
        // });
        // this.getOption('regionManager').get('app').show(appview);
        // this.options.appview = appview;
    },
    getParams : function() {
        var params = Url.parseQuery();
        if (params.zoom) this.params.zoom = parseInt(params.zoom);
        if (params.lat) this.params.location.lat = parseFloat(params.lat);
        if (params.lng) this.params.location.lng = parseFloat(params.lng);
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
