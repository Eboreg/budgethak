import AppRouter from 'marionette.approuter';
import Controller from './controller';

var Router = AppRouter.extend({
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
