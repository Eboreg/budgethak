var Backbone = require('backbone');

var Modal = Backbone.Model.extend({
    defaults : {
        content : '',
        open : false,
        name : 'Modal',
    }
});

module.exports = Modal;
