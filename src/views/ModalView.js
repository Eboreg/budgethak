import _ from 'underscore';
import $ from 'jquery';
import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import Modal from '../models/Modal';

var ModalView = Marionette.View.extend({
    model: new Modal(),
    className : 'w3-modal',
    template: _.template($('#modal').html()),
    ui: {
        close: '#close-modal',
        content: '#modal-content',
    },
    events : {
        'click' : 'conditionalClose',
        'click @ui.close' : 'close',
    },
    initialize: function() {
        _.bindAll(this, 'show');
        this.channel = Radio.channel('modal');
        this.channel.reply('show', this.show);
    },
    show: function(message) {
        this.getUI('content').html(message);
        this.open();
    },
    conditionalClose : function(e) {
        // Gå bara vidare om klicket är på det grå fältet utanför rutan
        if (e.target.className == 'w3-modal')
            this.close();
    },
    close : function() {
        this.$el.hide();
    },
    open : function() {
        this.$el.show();
    },
});

export default ModalView;
