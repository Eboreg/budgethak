import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Backbone from 'backbone';
import settings from './settings';
import Controller from './controller';
import Router from './router';
import AppView from './views/AppView';
import PlaceCollection from './collections/PlaceCollection';

var app = new Marionette.Application({
    region: '#app',
    routerEvents: {

    },
    onBeforeStart: function(app, options) {
        Radio.DEBUG = true;
        var router = new Router();
        var routerChannel = router.getChannel();
        this.bindEvents(routerChannel, this.routerEvents);
        this.collection = new PlaceCollection(options.initialData);
    },
    onStart : function(app, options) {
        //var controller = new Controller(options);
        Backbone.history.start({
            pushState : true,
            hashChange : false,
            root : settings.urlroot
        });
        //this.showView(new AppView());
        //this.getRegion().show(new AppView({collection: new PlaceCollection(window.budgethak.bootstrap)}));
    },
});

app.start({ initialData: window.budgethak.bootstrap });
