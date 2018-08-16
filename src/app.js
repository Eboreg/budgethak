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
    routerEvents: {
        'home': 'showHome',
        'info': 'showInfo',
        'place': 'showPlace',
    },
    mapEvents: {
        'openPlace': 'onOpenPlace',
        'closePlace': 'onClosePlace',
    },
    menuBarEvents: {
        'filter': 'onPlaceFilterChange',
    },
    
    initialize: function(options) {
        Radio.DEBUG = true;
        this.collection = new PlaceCollection(options.initialData);
        this.router = new Router();
        this.bindEvents(this.router.getChannel(), this.routerEvents);
        this.bindEvents(Radio.channel('menubar'), this.menuBarEvents);
        this.bindEvents(Radio.channel('map'), this.mapEvents);
        this.appView = new AppView({ collection: this.collection });
    },
    onStart : function() {
        Backbone.history.start({
            pushState : true,
            hashChange : false,
            root : settings.urlroot
        });
    },
    showHome: function() {
        this.appView.render();
    },
    showInfo: function() {},
    showPlace: function(slug) {},
    onPlaceFilterChange: function(filters) {
        this.appView.filterPlaces(filters);
    },
    onOpenPlace: function(place) {},
    onClosePlace: function(place) {},
});

var app = new App({ initialData: window.budgethak.bootstrap });
app.start();
