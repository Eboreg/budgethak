import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Backbone from 'backbone';
import settings from './settings';
import Router from './router';
import AppView from './views/AppView';
import PlaceCollection from './collections/PlaceCollection';

var App = Marionette.Application.extend({
    region: '#app',
    channelName: 'app',
    params : {
        zoom : settings.defaultZoom,
        location : {
            lat : settings.defaultLocation.lat,
            lng : settings.defaultLocation.lng,
        },
    },
    
    initialize: function(options) {
        Radio.DEBUG = true;
        this.collection = new PlaceCollection(options.initialData);
        this.router = new Router();
    },
    onStart : function() {
        Backbone.history.start({
            pushState : true,
            hashChange : false,
            root : settings.urlroot
        });
        this.showView(new AppView({ collection: this.collection }));
    },
    showInfo: function() {},
    showPlace: function(slug) {},
});

var app = new App({ initialData: window.budgethak.bootstrap });
app.start();
