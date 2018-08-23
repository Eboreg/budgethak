import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import _ from 'underscore';
import $ from 'jquery';
import 'jquery-touchswipe';
import 'timepicker';

var SidebarView = Marionette.View.extend({
    id: 'sidebar-container',
    className: 'w3-card-8',
    ui: {
        element: '#sidebar-element',
        close: '#close-sidebar-button',
        mapMarker: '#place-map-marker',
        placeEdit: '#edit-place-icon',
        placeEditCancel: '#edit-place-cancel',
        placeEditSubmit: '#edit-place-submit',
        placeName: '#name',
        placeBeerPrice: '#beer_price',
        placeBeerPriceUntil: '#beer_price_until',
        placeUteservering: '#uteservering',
        placeUserComment: '#user_comment',
        placeImage: '#image',
        errorMessage: '.error-message',
    },
    events: {
        'transitionend' : 'onTransitionEnd',
        'click @ui.close': 'onCloseClick',
        'click @ui.mapMarker': 'onMapMarkerClick',
        'click @ui.placeEdit': 'onEditClick',
        'click @ui.placeEditCancel': 'onEditCancelClick',
        'click @ui.placeEditSubmit': 'onEditSubmitClick',
    },
    template: _.template($('#sidebar-template').html()),
    options: {
        transition: true,
        isOpen: false,
        isFullyOpen: false,  // Behövs denna?
        place: null,
    },

    initialize : function(options) {
        this.options = _.extend(this.options, options);
        this.mergeOptions(this.options, [
            'transition', 'isOpen', 'isFullyOpen', 'place', 'newPlace',
        ]);
        this.modalChannel = Radio.channel('modal');
        _.bindAll(this, 'openInfo', 'openAddPlace', 'openPlace', 'close');
        if (this.isOpen) {
            this.transition = false;
            this.open();
        }
        this.channel = Radio.channel('sidebar');
        this.infoTemplate = _.template($('#info-text-template').html());
        this.placeAddTemplate = _.template($('#place-add-template').html());
        this.placeTemplate = _.template($('#place-text-template').html());
        this.placeEditTemplate = _.template($('#place-edit-template').html());
        this.thankYouTemplate = _.template($('#thank-you-text-template').html());
        if ($(window).width() <= 600) {
            this.$el.swipe({
                swipeRight : _.bind(function() {
                    this.close();
                }, this),
            });
        }
    },
    initiateTimepickers: function() {
        this.$('.timepicker').timepicker({
            scrollDefault : '12:00',
            timeFormat : 'H:i',
            step : 30,
            closeOnWindowScroll : true,
        });
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
        this.bindUIElements();
        this.initiateTimepickers();
        this.open();
    },
    openPlace: function(place) {
        var updateElement = _.bind(function(place) {
            this.getUI('element').html(this.placeTemplate(place.toJSONGrouped()));
            this.bindUIElements();
        }, this);
        if (place !== this.place) {
            this.place = place;
            this.listenToOnce(this.place, 'sync', updateElement);
            this.place.fetch();
        }
        updateElement(place);
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
    },

    /* UI-events */
    onEditCancelClick: function() {
        this.openPlace(this.place);
    },
    onCloseClick: function() {
        this.channel.trigger('close');
        this.close();
    },
    onEditClick: function() {
        this.getUI('element').html(this.placeEditTemplate(this.place.toJSONPadded()));
        this.bindUIElements();
        this.initiateTimepickers();
    },
    onEditSubmitClick: function() {
        this.getUI('errorMessage').text('');
        this.getUI('placeEditSubmit').prop('disabled', true);
        var opening_hours = [];
        for (var i = 0; i < 7; i++) {
            opening_hours.push({
                weekday : i,
                opening_time : this.$('#opening_time-'+i).val(),
                closing_time : this.$('#closing_time-'+i).val(),
                closed_entire_day : this.$('#closed_entire_day-'+i).prop('checked'),
            });
        }
        this.place.save({
            name : this.getUI('placeName').val(),
            beer_price : parseInt(this.getUI('placeBeerPrice').val()),
            beer_price_until : this.getUI('placeBeerPriceUntil').val(),
            uteservering : this.getUI('placeUteservering').prop('checked'),
            user_comment : this.getUI('placeUserComment').val(),
            image : this.getUI('placeImage').val(),
            opening_hours : opening_hours,
        }, { 
            wait: true, 
            success : _.bind(function() {
                this.getUI('placeEditSubmit').prop('disabled', false);
                this.openPlace(this.place);
                this.modalChannel.request('show', this.thankYouTemplate());
            }, this),
            error: _.bind(function(model, response) {
                this.getUI('placeEditSubmit').prop('disabled', false);
                var errors = response.responseJSON;
                for (var key in errors) {
                    var errortext = _.isArray(errors[key]) ? errors[key].join('<br/>') : errors[key];
                    this.$('.error-message[data-for=\''+key+'\']').text(errortext);
                }
            }, this),
        });
    },
    onMapMarkerClick: function() {
        this.channel.trigger('map-marker-click', this.place);
    },
    onTransitionEnd : function() {
        this.isFullyOpen = this.isOpen;
        if (!this.isFullyOpen) {
            // Har förekommit på mobil att det går att skrolla till den stängda sidebaren 
            // om den bara ligger utanför viewporten utan att vara dold
            this.$el.hide();
        }
        if (this.isOpen) {
            this.channel.trigger('fully-open');
        }
    },
});

export default SidebarView;
