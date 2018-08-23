import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import L from 'leaflet';
import settings from '../settings';

var PlaceView = Marionette.View.extend({
    template: false,
    modelEvents: {
        'change:visible': 'onChangeVisible',
    },
    options: {
        opened: false,
    },

    initialize: function(options) {
        this.channel = Radio.channel('place');
        this.options = _.extend(this.options, options);
        this.mergeOptions(this.options, ['markercluster', 'map', 'opened']);
        this.marker = new L.marker([this.model.get('lat'), this.model.get('lng')], { 
            title: this.model.get('name'),
            keyboard: false,
            riseOnHover: true,
            interactive: true,
            bubblingMouseEvents: true,
        });
        this.bindMarkerEvents();
        this.marker.on('click mousedown mouseup mouseover mouseout dragend moveend move drag', function(e) {
            console.log('marker: ' + e.type);
        });
    },
    render: function() {
        this.triggerMethod('before:render', this);
        if (this.opened) {
            this.marker.setIcon(settings.placeIconActive);
            this.markercluster.removeLayer(this.marker);
            this.map.addLayer(this.marker);
            this.marker.setZIndexOffset(1000);
        } else {
            this.marker.setIcon(settings.placeIcon);
            this.map.removeLayer(this.marker);
            this.markercluster.addLayer(this.marker);
            this.marker.setZIndexOffset(0);
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
    open: function() {
        this.opened = true;
        this.render();
    },
    close: function() {
        this.opened = false;
        this.render();
    },
    
    /* modelEvents */
    onChangeVisible: function(model, value) {
        if (true === value) {
            this.render();
        } else if (this._isRendered) {
            this.detach();
        }
    },

    /**
     * Delegerar valda Leaflet-events till View-events med namn 'marker:<leaflet-eventnamn>'.
     */
    bindMarkerEvents : function() {
        // var markerEventNames = [
        //     'click', 'dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu', 'dragstart', 'drag', 'dragend',
        //     'move', 'add', 'remove', 'popupopen', 'popupclose'
        // ];
        var markerEventNames = [ 'click', ];
        _.each(markerEventNames, function(markerEventName) {
            var handler = function(arg) {
                this.triggerMethod('marker:'+markerEventName, this, arg);
            };
            handler = _.bind(handler, this);
            this.marker.on(markerEventName, handler);
        }, this);
    },
});

export default PlaceView;
