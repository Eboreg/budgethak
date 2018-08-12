import Radio from 'backbone.radio';
import SidebarView from './SidebarView';

// model ska vara ett Place-objekt, redan fetchat och hitskickat av
// t.ex. Controller
var SidebarPlaceView = SidebarView.extend({
    template : '#place-text',
    ui: {
        panTo: '#place-map-marker',
        edit: '#edit-place-icon',
    },
    events: {
        'click @ui.panTo': 'panTo',
        'click @ui.edit': 'openPlaceEditor',
    },
    panTo: function() {
        Radio.channel('map').request('panTo', this.model.get('location'));
    },
    openPlaceEditor: function() {
        
    },
});

export default SidebarPlaceView;
