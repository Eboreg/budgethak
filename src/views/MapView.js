import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import L from 'leaflet';
import 'leaflet.markercluster';
import PlaceView from './PlaceView';
import settings from '../settings';

var MapView = Marionette.CollectionView.extend({
    id : 'map-element',
    template: _.noop,
    childView: PlaceView,
    childViewOptions: function() {
        return { 
            markercluster: this.markercluster,
            map: this.map,
        };
    },
    viewFilter: { visible: true, },

    initialize: function() {
        this.channel = Radio.channel('map');
        this.modalChannel = Radio.channel('modal');
        this.rendered = false;
        this.zoom = settings.defaultZoom;
        this.location = settings.defaultLocation;
        this.userLocation = null;
        this.userMarker = null;
        this.markercluster = L.markerClusterGroup({
            maxClusterRadius : settings.maxClusterRadius,
        });
        _.bindAll(this, 'gotoMyLocation', 'changeMaxBeerPrice', 'activateFilterClosedPlaces', 
            'deactivateFilterClosedPlaces');
        this.channel.reply('goto:myLocation', this.gotoMyLocation);
        this.channel.reply('change:maxBeerPrice', this.changeMaxBeerPrice);
        this.channel.reply('activate:filter:closedPlaces', this.activateFilterClosedPlaces);
        this.channel.reply('deactivate:filter:closedPlaces', this.deactivateFilterClosedPlaces);
    },
    onAttach: function() {
        if (!this.rendered) {
            this.renderMap();
        } else {
            this.flyTo(this.location);
        }
    },
    renderMap: function() {
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
        this.map.setView(this.location, this.zoom);
    },
    gotoMyLocation: function() {
        // Vi söker efter användarens plats först när denne aktivt ber om det.
        // När den hittas, triggar kartan "locationfound"-event.
        // Om något går fel, triggas "locationerror".
        if (null === this.userLocation) {
            this.map.locate({
                watch : true,
                locate : true,
                setView : false,
                maxZoom : 15,
                enableHighAccuracy : true,
            });
        } else {
            this.map.flyTo(this.userLocation.latlng, 17);
        }
    },
    changeMaxBeerPrice: function(value) {
        //this.viewFilter
    },
    activateFilterClosedPlaces: function() {

    },
    deactivateFilterClosedPlaces: function() {

    },

    /* this.triggers */
    onMapLoad: function() {
        this.map.addLayer(this.markercluster);
        this.rendered = true;
    },
    onMapClick: function() {},
    onMapZoomend: function() {
        this.zoom = this.map.getZoom();
    },
    onMapMoveend: function() {
        this.location = this.map.getCenter();
    },
    onMapLocationfound: function(event) {
        this.userLocation = event.latlng;
        if (this.userMarker === null) {
            this.userMarker = L.userMarker(event.latlng, {
                smallIcon : true,
            }).addTo(this.map);
            this.map.flyTo(event.latlng, 17);
        }
        this.userMarker.setLatLng(event.latlng);
        this.userMarker.setAccuracy(event.accuracy);
    },
    onMapLocationerror: function(error) {
        this.modalChannel.request('show', '<p>Kunde inte hämta din position!</p><p>Felmeddelande: '+error.message+'</p>');
    },

    /**
     * Delegerar valda Leaflet-events till View-events med namn 'map:<leaflet-eventnamn>'.
     */
    bindMapEvents : function() {
        var mapEventNames = [
            'click', 'load', 'moveend', 'zoomend', 'locationfound', 'locationerror',
        ];
        _.each(mapEventNames, function(mapEventName) {
            var handler = function(arg) {
                this.triggerMethod('map:'+mapEventName, arg);
            };
            handler = _.bind(handler, this);
            this.map.on(mapEventName, handler);
        }, this);
    },
});

export default MapView;
