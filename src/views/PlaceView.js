import Marionette from 'backbone.marionette';
import _ from 'underscore';
import L from 'leaflet';
import settings from '../settings';

var PlaceView = Marionette.View.extend({
    template: _.noop,
    modelEvents: {
        'change:visible change:opened': 'render',
    },

    initialize: function(options) {
        this.mergeOptions(options, ['markercluster', 'map']);
        this.marker = new L.marker([this.model.get('lat'), this.model.get('lng')], {
            icon : (this.model.get('opened') ? settings.placeIconActive : settings.placeIcon),
        });
    },
    render: function() {
        if (this.model.get('opened')) {
            this.marker.setIcon(settings.placeIconActive);
            this.map.addLayer(this.marker);
        }
        if (this.model.get('visible')) {
            this.markercluster.addLayer(this.marker);
        }
    },
});

export default PlaceView;
