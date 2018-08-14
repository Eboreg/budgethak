import EventRouter from 'backbone.eventrouter';

var Router = EventRouter.extend({
    channelName: 'router',
    routeTriggers: {
        'home': '',
        'info': 'info/',
        'place': 'place/:slug/',
    },
});

export default Router;
