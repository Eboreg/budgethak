/**
 * Övergripande View som sköter den nödvändiga kommunikationen mellan views.
 */

import Marionette from 'backbone.marionette';
import MapView from './MapView';
import MenuBarView from './MenuBarView';
import SidebarView from './SidebarView';
import ModalView from './ModalView';

var AppView = Marionette.View.extend({
    el: '#app',
    template: '#app-template',
    regions: {
        map: '#map-wrapper',
        sidebar: {
            el: '#sidebar-container',
            replaceElement: true,
        },
        modal: '#modal-container',
        menuBar: '.leaflet-control-container .leaflet-top.leaflet-left',
    },
    onRender: function() {
        this.showChildView('sidebar', new SidebarView());
        this.showChildView('modal', new ModalView());
        var mapView = new MapView({ collection: this.collection, sort: false });
        this.showChildView('map', mapView);
        this.showChildView('menuBar', new MenuBarView({map: mapView.map, collection: this.collection}));
    }
});

export default AppView;
