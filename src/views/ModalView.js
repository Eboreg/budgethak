define([
    'backbone',
    'underscore',
	'jquery',
	'models/Modal',
], function(Backbone, _, $, Modal) {
    var ModalView = Backbone.View.extend({
        className : 'w3-modal',
        events : {
            'click' : 'conditionalClose',
            'click #close-modal' : 'close',
        },
        template : _.template($("#modal").html()),
        model : Modal,

        initialize : function() {
            this.listenTo(this.model, 'change:content', this.setContent);
            this.listenTo(this.model, 'change:open', this.toggleOpen);
            this.$el.html(this.template(this.model.toJSON()));
        },
        setContent : function(model, value) {
            this.$("#modal-content").html(value);
        },
        toggleOpen : function(model, value) {
            if (true == value) {
                this.$el.show();
            } else {
                this.$el.hide();
            }
        },
        conditionalClose : function(e) {
            // Gå bara vidare om klicket är på det grå fältet utanför rutan
            if (e.target.className == 'w3-modal')
                this.close();
        },
        close : function(e) {
            this.model.set("open", false);
        },
        open : function() {
            this.model.set("open", true);
        },
    });
    return new ModalView();
});
