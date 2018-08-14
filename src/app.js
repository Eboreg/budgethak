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

    onStart : function(app, options) {
        Radio.DEBUG = true;
        //var controller = new Controller(options);
        var router = new Router();
        var routerChannel = router.getChannel();
        routerChannel.on('info', function() {
            console.log('info');
        });
        routerChannel.on('home', function() {
            console.log('home');
        });
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
