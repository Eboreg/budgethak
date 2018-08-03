var Marionette = require('backbone.marionette');
var Modal = require('../models/Modal');

var ModalView = Marionette.View.extend({
    model: new Modal(),
    el: '#modal-container',
    template: '#modal',
    channelName: 'modal',
    events : {
        'click' : 'conditionalClose',
        'click #close-modal' : 'close',
    },
    radioRequests: {
        'show': function(message) {
            this.model.set('content', message);
            this.model.set('open', true);
        },
    },
    modelEvents: {
        'change:content': this.contentChanged,
        'change:open': this.openChanged,
    },
    contentChanged: function(model, value) {
        this.$('#modal-content').html(value);
    },
    conditionalClose : function(e) {
        // Gå bara vidare om klicket är på det grå fältet utanför rutan
        if (e.target.className == 'w3-modal')
            this.close();
    },
    close : function() {
        this.model.set('open', false);
    },
    open : function() {
        this.model.set('open', true);
    },
    openChanged: function(model, value) {
        if (true == value) {
            this.$el.show();
        } else {
            this.$el.hide();
        }
    },
});

module.exports = ModalView;
