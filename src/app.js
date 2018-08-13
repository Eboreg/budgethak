import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Backbone from 'backbone';
import Router from './router';
import AppView from './views/AppView';
import PlaceCollection from './collections/PlaceCollection';

var app = new Marionette.Application({
    region: '#app',

    onStart : function() {
        Radio.DEBUG = true;
        //var router = new Router(options);
        //Backbone.history.start();
        //this.showView(new AppView());
        this.getRegion().show(new AppView({collection: new PlaceCollection(window.budgethak.bootstrap)}));
    },
});

app.start();
