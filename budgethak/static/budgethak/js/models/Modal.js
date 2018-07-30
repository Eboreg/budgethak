define([
	'backbone',
], function(Backbone) {
    var Modal = Backbone.Model.extend({
        defaults : {
            content : "",
            open : false,
            name : "Modal",
        }
    });
    return new Modal();
});
