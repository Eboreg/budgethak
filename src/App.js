var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
var Router = require('./Router');
var AppView = require('./views/AppView');

var app = new Marionette.Application({
    region: '#app',

    onStart : function(options) {
        var router = new Router(options);
        Backbone.history.start();
        this.showView(new AppView());
    },
});

app.start();
