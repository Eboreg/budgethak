import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import settings from '../settings';
import L from 'leaflet';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';
import 'jquery-ui/ui/widgets/slider';

var MenuBarView = Marionette.View.extend({
    template: '#menu-bar',
    templateContext: {
        max_beer_price: settings.maxBeerPrice,
    },
    ui: {
        myLocation: '#my-location-icon',
        mobileMenu: '#mobile-menu-button',
        filterClosedPlaces: '#filter-closed-places-icon',
        info: '#info-icon',
        addPlace: '#add-place-icon',
        searchIcon: '#search-icon',
        searchField: '#search-field',
        searchFieldContainer: '#search-field-container',
        maxBeerPriceSlider: '#max-beer-price-slider',
        maxBeerPriceText: '#max-beer-price',
    },
    events: {
        'click @ui.searchIcon': 'openSearchField',
        'focusout @ui.searchField': 'closeSearchField',
    },
    triggers: {
        'click @ui.myLocation': 'myLocation:click',
        'click @ui.mobileMenu': 'mobileMenu:click',
        'click @ui.filterClosedPlaces': 'filterClosedPlaces:click',
        'click @ui.info': 'info:click',
        'click @ui.addPlace': 'addPlace:click',
        'transitionend @ui.searchFieldContainer': 'searchFieldContainer:transition:end',
    },

    initialize: function (options) {
        this.channel = Radio.channel('menubar');
        this.mapChannel = Radio.channel('map');
        this.sidebarChannel = Radio.channel('sidebar');
        this.map = options.map;
        this.autocompleteSource = this.collection.autocomplete;
        this.searchFieldOpen = false;
        this.maxBeerPrice = settings.maxBeerPrice;
        this.mobileMenuOpen = false;
        this.filterClosedPlaces = false;
        this.infoActive = false;
        this.addPlaceActive = false;
        this.control = L.control({
            position: 'topleft'
        });
        _.bindAll(this, 'changeMaxBeerPrice', 'activateInfo', 'deactivateInfo');
        this.channel.reply('activate:info', this.activateInfo);
        this.channel.reply('deactivate:info', this.deactivateInfo);
        this.listenTo(this.sidebarChannel, 'close', function() {
            this.deactivateAddPlace();
            this.deactivateInfo();
        });
    },
    onRender: function () {
        this.control.onAdd = _.bind(function () {
            return this.$el[0];
        }, this);
        this.control.addTo(this.map);
        // När maxpris-slider slide:as, ska text bredvid den uppdateras:
        var slideFunc = _.bind(function (event, ui) {
            this.$('#max-beer-price').text(ui.value);
        }, this);
        L.DomEvent.disableClickPropagation(this.el);
        L.DomEvent.disableScrollPropagation(this.el);
        // Lägg till maxpris-slider och bind till event:
        $('#max-beer-price-slider').slider({
            value: this.maxBeerPrice,
            min: settings.minBeerPrice,
            max: settings.maxBeerPrice,
            step: settings.beerPriceSliderStep,
            slide: slideFunc,
            change: this.changeMaxBeerPrice,
        });
        if (this.infoActive)
            this.$('#info-icon').addClass('active');
        this.setupAutocomplete();
    },
    activateInfo: function() {
        this.infoActive = true;
        this.getUI('info').addClass('active');
        this.deactivateAddPlace();
    },
    deactivateInfo: function() {
        this.infoActive = false;
        this.getUI('info').removeClass('active');
    },
    activateFilterClosedPlaces: function() {
        this.filterClosedPlaces = true;
        this.getUI('filterClosedPlaces').addClass('active');
    },
    deactivateFilterClosedPlaces: function() {
        this.filterClosedPlaces = false;
        this.getUI('filterClosedPlaces').removeClass('active');
    },
    activateAddPlace: function() {
        this.addPlaceActive = true;
        this.getUI('addPlace').addClass('active');
        this.deactivateInfo();
    },
    deactivateAddPlace: function() {
        this.addPlaceActive = false;
        this.getUI('addPlace').removeClass('active');
    },
    openSearchField: function () {
        if ($(window).width() > 600) {
            this.getUI('searchFieldContainer').addClass('open');
        }
    },
    closeSearchField: function () {
        if ($(window).width() > 600) {
            this.getUI('searchFieldContainer').removeClass('open');
        }
    },
    setupAutocomplete: function () {
        var template = _.template($('#autocomplete-item').html());
        var selectFunc = _.bind(function (event, ui) {
            this.closeSearchField();
            // TODO: Skriv om för Radio?
            this.trigger('autocomplete-select', ui.item.id);
        }, this);
        $.widget('ui.autocomplete', $.ui.autocomplete, {
            _renderItem: function (ul, item) {
                return $(template(item)).appendTo(ul);
            },
            _resizeMenu: function () {
                var maxHeight = $(document).height() - $('#search-field').offset().top
                    - $('#search-field').height() - 10;
                this.menu.element.css('max-height', maxHeight);
            },
        });
        this.getUI('searchField').autocomplete({
            source: this.autocompleteSource,
            minLength: 1,
            select: selectFunc,
        });
        this.getUI('searchField').focus(function () {
            $(this).autocomplete('search');
        });
    },
    changeMaxBeerPrice: function (event, ui) {
        this.maxBeerPrice = ui.value;
        this.mapChannel.request('change:maxBeerPrice', ui.value);
    },

    /* this.triggers */
    onMobileMenuButtonClick: function () {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        if (this.mobileMenuOpen)
            this.$('.menu-bar-row').css('display', 'flex');
        else
            this.$('.menu-bar-row').hide();
    },
    onSearchFieldContainerTransitionEnd: function (view, event) {
        if (event.originalEvent.propertyName == 'width') {
            this.searchFieldOpen = !this.searchFieldOpen;
            if (this.searchFieldOpen) {
                this.getUI('searchField').focus();
            }
        }
    },
    onMyLocationClick: function () {
        this.mapChannel.request('goto:myLocation');
    },
    onFilterClosedPlacesClick: function () {
        if (this.filterClosedPlaces) {
            this.deactivateFilterClosedPlaces();
            this.getUI('filterClosedPlaces').attr('title', 'Dölj stängda platser');
            this.mapChannel.request('deactivate:filter:closedPlaces');
        } else {
            this.activateFilterClosedPlaces();
            this.getUI('filterClosedPlaces').attr('title', 'Visa stängda platser');
            this.mapChannel.request('activate:filter:closedPlaces');
        }
    },
    onInfoClick: function () {
        if (this.infoActive) {
            this.deactivateInfo();
            this.sidebarChannel.request('close');
        } else {
            this.activateInfo();
            this.sidebarChannel.request('open:info');
        }
    },
    onAddPlaceClick: function() {
        if (this.addPlaceActive) {
            this.deactivateAddPlace();
            this.sidebarChannel.request('close');
        } else {
            this.activateAddPlace();
            this.sidebarChannel.request('open:addPlace');
        }
    },
});

export default MenuBarView;
