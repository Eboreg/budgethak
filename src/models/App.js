var Backbone = require('backbone');

var App = Backbone.Model.extend({
    defaults : {
        filterClosedPlaces : false,
        maxBeerPrice : 40,
    },
});

module.exports = App;
