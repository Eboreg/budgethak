var Marionette = require('backbone.marionette');
var Controller = require('./Controller');

var Router = Marionette.AppRouter.extend({
    appRoutes: {
        'place/:slug/' : 'renderPlace',
        'info/' : 'renderInfo',
        '*default' : 'renderMap',
    },
    initialize: function() {
        this.controller = new Controller({
            initialData: this.getOption('initialData'),
        });
    },
});

module.exports = Router;
