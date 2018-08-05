import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Router from './router';
import AppView from './views/AppView';

var app = new Marionette.Application({
    region: '#app',

    onStart : function() {
        //var router = new Router(options);
        //Backbone.history.start();
        //this.showView(new AppView());
        this.getRegion().show(new AppView());
    },
});

app.start();
