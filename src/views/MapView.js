import View from 'backbone.marionette';
import Map from '../models/Map';
import settings from '../settings';
import L from 'leaflet';
import 'leaflet.markercluster';

var MapView = View.extend({
    model: new Map(),
    initialize: function() {
        this.markercluster = L.markerClusterGroup({
            maxClusterRadius : settings.maxClusterRadius,
        });
    },
    onRender: function() {
        if (!this.model.get('rendered')) {
            this.map = L.map(this.el, {
                maxZoom : settings.maxZoom,
                zoomControl : false,
                attributionControl : false,
            });
            this.bindMapEvents();
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                id : 'mapbox.streets',
                accessToken: settings.mapboxAccessToken,
            }).addTo(this.map);
            L.control.attribution({
                position : 'bottomleft',
            }).addAttribution('Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>')
                .addTo(this.map);
            // Triggar map:load som kör this.onMapReady():
            this.map.setView(this.model.get('location'), this.model.get('zoom'));
        } else {
            this.flyTo(this.model.get('location'));
        }
    },
});

export default MapView;
