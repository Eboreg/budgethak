import Marionette from 'backbone.marionette';
import Controller from './controller';

var Router = Marionette.AppRouter.extend({
    appRoutes: {
        'place/:slug/' : 'renderPlace',
        'info/' : 'renderInfo',
        '*default' : 'renderMap',
    },
    initialize: function(options) {
        this.controller = new Controller({
            initialData: this.getOption('initialData'),
        });
    },
});

export default Router;
