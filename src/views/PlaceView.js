import Marionette from 'backbone.marionette';
import L from 'leaflet';
import settings from '../settings';

var PlaceView = Marionette.View.extend({
    template: false,
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
        this.triggerMethod('before:render', this);
        if (!this.model.get('visible')) {
            if (this._isRendered) {
                this.detach();
            }
        } else if (this.model.get('opened')) {
            this.marker.setIcon(settings.placeIconActive);
            this.map.addLayer(this.marker);
        } else {
            this.markercluster.addLayer(this.marker);
        }
        this._isRendered = true;
        this.triggerMethod('render', this);
        return this;
    },
    detach: function() {
        this.triggerMethod('before:detach', this);
        this.markercluster.removeLayer(this.marker);
        this.map.removeLayer(this.marker);
        this.triggerMethod('detach', this);
    }
});

export default PlaceView;
