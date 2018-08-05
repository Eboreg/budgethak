/**
 * Övergripande View som sköter den nödvändiga kommunikationen mellan views.
 */

import Marionette from 'backbone.marionette';
import _ from 'underscore';
import MapView from './MapView';
import SidebarView from './SidebarView';
import SidebarPlaceView from './SidebarPlaceView';
import ModalView from './ModalView';

var AppView = Marionette.View.extend({
    el: '#app',
    template: '#app-template',
    regions: {
        map: '#map-element',
        sidebar: '#sidebar-container',
        modal: '#modal-container',
    },
    onRender: function() {
        console.log('AppView.initialize');
        //this.showChildView('map', new MapView());
        this.showChildView('sidebar', new SidebarView());
        //this.showChildView('sidebar', new SidebarPlaceView());
        this.showChildView('modal', new ModalView());
    }
});

export default AppView;