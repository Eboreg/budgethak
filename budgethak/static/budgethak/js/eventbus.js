define([
    'backbone',
    'underscore',
    'models/Modal',
    'models/Map',
    'models/MenuBar',
    'models/Sidebar',
    'collections/PlaceCollection',
    'views/SidebarView',
], function(Backbone, _, Modal, Map, MenuBar, Sidebar, PlaceCollection, SidebarView) {
    var EventBus = {};
    _.extend(EventBus, Backbone.Events);

    // Eventlisteners på mig själv:
    EventBus.on('modal', function(content) {
        Modal.set('content', content);
        Modal.set('open', true);
    });

    // Eventlisteners på andra:
    EventBus.listenTo(Map, 'change:userLocation', function(model, value) { });
    EventBus.listenTo(Map, 'change:zoom change:location', function(model, value) { });
    EventBus.listenTo(Map, 'change:rendered', function(model, value) { });
    EventBus.listenTo(Map, 'change:userMarkerSet', function(model, value) { });
    EventBus.listenTo(MenuBar, 'change:infoActive', function(model, value) {
        Sidebar.set('infoOpen', value);
        if (value) {
            this.trigger('user-opened-info');
        } else {
            this.trigger('user-closed-sidebar');
        }
    });
    EventBus.listenTo(MenuBar, 'change:addPlaceActive', function(model, value) {
        Sidebar.set('addPlaceOpen', value);
        if (value) {
            this.trigger('user-opened-add-place');
        } else {
            this.trigger('user-closed-sidebar');
        }
    });
    EventBus.listenTo(MenuBar, 'change:mobileMenuOpen', function(model, value) { });
    // Refaktorera dessa som har att göra med AppView:filterPlaces() när jag är mer klar i huvudet:
    EventBus.listenTo(MenuBar, 'change:maxBeerPrice', function(model, value) { });
    EventBus.listenTo(MenuBar, 'change:filterClosedPlaces', function(model, value) { });

    EventBus.listenTo(MenuBar, 'change:searchFieldOpen', function(model, value) { });
    EventBus.listenTo(Modal, 'change:open', function(model, value) { });
    EventBus.listenTo(Modal, 'change:content', function(model, value) { });
    EventBus.listenTo(Sidebar, 'change:infoOpen', function(model, value) {
        MenuBar.set('infoActive', value);
    });
    EventBus.listenTo(Sidebar, 'change:addPlaceOpen', function(model, value) {
        if (true === value) {
			var place = PlaceCollection.createEmptyPlace();
			MenuBar.set('place', place);
			MenuBar.set('addPlaceActive', true);
        } else {
            MenuBar.set('addPlaceActive', false);
        }
    });
    EventBus.listenTo(Sidebar, 'change:place', function(model, value) { });
    EventBus.listenTo(Sidebar, 'change:open', function(model, value) { });
    EventBus.listenTo(Sidebar, 'change:fullyOpen', function(model, value) { });
    EventBus.listenTo(Sidebar, 'change:transition', function(model, value) { });
    EventBus.listenTo(SidebarView, 'place-open', function(place) {
        place.set('opened', true);
    });
    EventBus.listenTo(SidebarView, 'place-close', function(place) {
        place.set('opened', false);
    });
    EventBus.listenTo(PlaceCollection, 'add', function(model) { });
    EventBus.listenTo(PlaceCollection, 'remove', function(model) { });
    EventBus.listenTo(PlaceCollection, 'update', function(collection) { });
    EventBus.listenTo(PlaceCollection, 'reset', function(collection) { });
    EventBus.listenTo(PlaceCollection, 'change:visible', function(model, value) { });
    EventBus.listenTo(PlaceCollection, 'change:opened', function(model, value) { });

    return EventBus;
});
