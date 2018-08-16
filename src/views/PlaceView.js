import Marionette from 'backbone.marionette';
import _ from 'underscore';
import L from 'leaflet';
import settings from '../settings';

var PlaceView = Marionette.View.extend({
    template: false,
    modelEvents: {
        'change:visible change:opened': 'render',
    },

    initialize: function(options) {
        this.mergeOptions(options, ['markercluster', 'map']);
        this.marker = new L.marker([this.model.get('lat'), this.model.get('lng')]);
        this.bindMarkerEvents();
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
            this.marker.setIcon(settings.placeIcon);
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
    },

    /* triggerMethods */
    onMarkerClick: function() {
        this.model.set('opened', !this.model.get('opened'));
    },

    /**
     * Delegerar valda Leaflet-events till View-events med namn 'marker:<leaflet-eventnamn>'.
     */
    bindMarkerEvents : function() {
        var markerEventNames = [
            'click', 'dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu', 'dragstart', 'drag', 'dragend',
            'move', 'add', 'remove', 'popupopen', 'popupclose'
        ];
        _.each(markerEventNames, function(markerEventName) {
            var handler = function(arg) {
                this.triggerMethod('marker:'+markerEventName, arg);
            };
            handler = _.bind(handler, this);
            this.marker.on(markerEventName, handler);
        }, this);
    },
});

export default PlaceView;
