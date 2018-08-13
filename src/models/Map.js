var Backbone = require('backbone');
var settings = require('../settings');

var Map = Backbone.Model.extend({
    defaults : {
        rendered : false,
        zoom : settings.defaultZoom,
        location : settings.defaultLocation,
        userLocation : null,
        userMarkerSet : false,
        name : 'Map',
    },
});

module.exports = Map;
