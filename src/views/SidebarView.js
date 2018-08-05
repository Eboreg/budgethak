import Marionette from 'backbone.marionette';
import _ from 'underscore';
import Sidebar from '../models/Sidebar';

var SidebarView = Marionette.View.extend({
    id: 'sidebar-element',
    className: 'w3-container',
    ui: {
        close: '#close-sidebar-button',
    },
    template: _.noop,

    initialize : function() {
        this.model = new Sidebar();
    }
});

export default SidebarView;
