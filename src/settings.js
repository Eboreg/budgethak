var L = require('leaflet');

var settings = {
    urlroot : '/',
    defaultZoom : 13,
    defaultLocation : { lat : 59.3219, lng : 18.0720 },
    maxZoom : 17,
    maxClusterRadius : 15,
    maxBeerPrice : 40,
    minBeerPrice : 20,
    maxAutocompleteMatches : 10,
    beerPriceSliderStep : 5,
    placeIcon : L.icon({
        iconUrl : '/media/beermug-dark.png',
        iconSize : [30, 28.234],
        shadowUrl : '/media/beermug-shadow.png',
        shadowSize : [45, 28.234],
        shadowAnchor : [15, 15],
    }),
    placeIconActive : L.icon({
        iconUrl : '/media/beermug.png',
        iconSize : [40, 37.645],
        shadowUrl : '/media/beermug-shadow.png',
        shadowSize : [47.814, 37.645],
        shadowAnchor : [15, 20],
    }),
    mapboxAccessToken: 'pk.eyJ1Ijoia2xhYXR1IiwiYSI6ImNqaWxrb3lqNTI3amYzcW43M21neDZ5cnoifQ.Rqpgr56qRWaByXSqWT0OrQ',
};

module.exports = settings;
