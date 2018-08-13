import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import _ from 'underscore';
import $ from 'jquery';
import 'jquery-touchswipe';
import 'timepicker';
import Place from '../models/Place';

var SidebarView = Marionette.View.extend({
    id: 'sidebar-container',
    className: 'w3-card-8',
    ui: {
        element: '#sidebar-element',
        close: '.close',
    },
    events: {
        'transitionend' : 'onTransitionEnd',
        'click @ui.close': 'close',
    },
    template: _.template($('#sidebar-template').html()),

    initialize : function(options) {
        this.transition = true;
        this.isOpen = false;
        this.isFullyOpen = false;  // Behövs denna?
        this.place = null;
        this.newPlace = new Place();
        if (options && options.open) {
            this.transition = false;
            this.open();
        }
        this.channel = Radio.channel('sidebar');
        this.infoTemplate = _.template('#info-text');
        this.placeAddTemplate = _.template('#place-add');
        if ($(window).width() <= 600) {
            this.$el.swipe({
                swipeRight : _.bind(function() {
                    this.close();
                }, this),
            });
        }
        _.bindAll(this, 'openInfo', 'openAddPlace', 'close');
        this.channel.reply('open:info', this.openInfo);
        this.channel.reply('open:addPlace', this.openAddPlace);
        this.channel.reply('close', this.close);
    },
    // addClass() sätter igång CSS-transition, efter vilken 'transitionend' triggas 
    open : function() {
        if (!this.isOpen) {
            this.isOpen = true;
            this.$el.show();
            // Elementet har från början ej klass "transition" eftersom den då blir felcentrerad om url = place/:id
            if (this.transition) {
                this.$el.addClass('transition open');
            } else {
                this.$el.addClass('open');
                this.isFullyOpen = true;
            }
        }
    },
    openInfo: function() {
        this.getUI('element').html(this.infoTemplate());
        this.open();
    },
    openAddPlace: function() {
        this.getUI('element').html(this.placeAddTemplate(this.newPlace.toJSON()));
        this.$('.timepicker').timepicker({
            scrollDefault : '12:00',
            timeFormat : 'H:i',
            step : 30,
            closeOnWindowScroll : true,
        });
        this.open();
    },
    // removeClass() sätter igång CSS-transition, efter vilken 'transitionend' triggas 
    close : function() {
        if (!this.transition) {
            this.$el.addClass('transition');
            this.transition = true;
        }
        this.$el.removeClass('open');
        this.isOpen = false;
        this.channel.trigger('close');
    },
    onTransitionEnd : function() {
        this.isFullyOpen = this.isOpen;
        if (!this.isFullyOpen) {
            // Har förekommit på mobil att det går att skrolla till den stängda sidebaren 
            // om den bara ligger utanför viewporten utan att vara dold
            this.$el.hide();
        }
    },
});

export default SidebarView;
