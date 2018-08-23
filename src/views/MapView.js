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
    childViewEventPrefix: 'childview',
    viewFilter: { visible: true, },
    collectionEvents: {
        'change:opened': 'onPlaceOpenedChange',
    },
    options: {
        rendered: false,
        zoom: settings.defaultZoom,
        location: settings.defaultLocation,
        userLocation: null,
        userMarker: null,
        openPlaceView: null,
    },

    initialize: function(options) {
        this.channel = Radio.channel('map');
        this.modalChannel = Radio.channel('modal');
        this.options = _.extend(this.options, options);
        this.mergeOptions(this.options, [
            'zoom', 'rendered', 'location', 'userLocation', 'userMarker', 'openPlaceView',
        ]);
        _.bindAll(this, 'filterPlaces', 'gotoMyLocation', 'flyToPlace', 'resize');
        this.markercluster = L.markerClusterGroup({
            maxClusterRadius : settings.maxClusterRadius,
        });
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
    },
    onAttach: function() {
        if (!this.rendered) {
            this.renderMap();
        } else {
            this.flyTo(this.location);
        }
    },
    renderMap: function() {
        this.map.setView(this.location, this.zoom);
        this.map.on('resize zoomend moveend click', function(e) {
            console.log(e.type);
        });
    },
    flyTo: function(location) {
        this.map.flyTo(location, 17);
    },
    flyToPlace: function(place) {
        this.flyTo({lat: place.get('lat'), lng: place.get('lng')});
    },
    resize: function() {
        this.map.invalidateSize({animate: false, pan: false});
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
    filterPlaces: function(filters) {
        this.children.each(function(view) {
            if (view.model.get('beer_price') <= parseInt(filters.maxBeerPrice) 
                && (!filters.filterClosedPlaces || view.model.get('open_now')))
                view.model.set('visible', true);
            else
                view.model.set('visible', false);
        });
    },
    closePlace: function() {
        // Stäng öppen plats, oavsett vilken den är
        if (this.openPlaceView) {
            this.openPlaceView.close();
            this.openPlaceView = null;
        }
        this.map.fire('click');
    },

    /* triggerMethods */
    onChildviewMarkerClick: function(placeview) {
        if (placeview === this.openPlaceView) {
            // Om klick på öppen plats: stäng den
            placeview.close();
            this.openPlaceView = null;
            this.channel.trigger('place:close');
        } else {
            // Stäng ev. tidigare öppen plats
            if (this.openPlaceView) {
                this.openPlaceView.close();
            }
            placeview.open();
            this.openPlaceView = placeview;
            this.channel.trigger('place:open', placeview.model);
        }
    },
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
    onMapLocationerror: _.once(function(error) {
        this.modalChannel.request('show', '<p>Kunde inte hämta din position!</p><p>Felmeddelande: '+error.message+'</p>');
    }),

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
