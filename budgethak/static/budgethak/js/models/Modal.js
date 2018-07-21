define([
	'backbone',
], function(Backbone) {
    var Modal = Backbone.Model.extend({
        defaults : {
            content : "",
            open : false,
        }
    });
    return new Modal();
});
