var Backbone = require('backbone');

var MenuBar = Backbone.Model.extend({
    defaults : {
        infoActive : false,
        addPlaceActive : false,
        mobileMenuOpen : false,
        maxBeerPrice : 40,
        filterClosedPlaces : false,
        searchFieldOpen : false, // searchFieldOpen är ett deskriptivt fält, inte något som events ska reagera på utan som bara ska kollas
        name : 'Menu bar',
    },
});

module.exports = MenuBar;
