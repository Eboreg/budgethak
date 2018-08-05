import Marionette from 'backbone.marionette';
import Modal from '../models/Modal';

var ModalView = Marionette.View.extend({
    model: new Modal(),
    className : 'w3-modal',
    template: '#modal',
    channelName: 'modal',
    ui: {
        close: '#close-modal',
        content: '#modal-content',
    },
    events : {
        'click' : 'conditionalClose',
        'click @ui.close' : 'close',
    },
    radioRequests: {
        'show': 'show',
    },
    show: function(message) {
        this.getUI('content').html(message);
    },
    modelEvents: {
        'change:content': 'contentChanged',
        'change:open': 'openChanged',
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

export default ModalView;
