import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import settings from '../settings';
import L from 'leaflet';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';
import 'jquery-ui/ui/widgets/slider';

var MenuBarView = Marionette.View.extend({
    template: _.template($('#menu-bar').html()),
    templateContext: {
        max_beer_price: settings.maxBeerPrice,
    },
    ui: {
        myLocation: '#my-location-icon',
        myLocationIcon: '#my-location-icon .icon',
        myLocationAjaxLoader: '#my-location-icon .ajax-loader',
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
        this.mobileMenuOpen = false;
        this.infoActive = false;
        this.addPlaceActive = false;
        this.control = L.control({
            position: 'topleft'
        });
        this.placeFilters = {
            maxBeerPrice: settings.maxBeerPrice,
            filterClosedPlaces: false,
        };
        _.bindAll(this, 'onMaxBeerPriceChange', 'activateInfo', 'deactivateInfo');
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
            value: this.placeFilters.maxBeerPrice,
            min: settings.minBeerPrice,
            max: settings.maxBeerPrice,
            step: settings.beerPriceSliderStep,
            slide: slideFunc,
            change: this.onMaxBeerPriceChange,
        });
        if (this.infoActive)
            this.activateInfo();
        this.setupAutocomplete();
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
    placeFiltersChange: function() {
        this.channel.trigger('filter', this.placeFilters);
    },

    /* Funktioner för att ändra i UI */
    activateInfo: function() {
        this.infoActive = true;
        this.getUI('info').addClass('active');
        this.deactivateAddPlace();
    },
    deactivateInfo: function() {
        this.infoActive = false;
        this.getUI('info').removeClass('active');
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

    /* Svar på UI-events */
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
    onMaxBeerPriceChange: function (event, ui) {
        this.placeFilters.maxBeerPrice = ui.value;
        this.placeFiltersChange();
    },
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
        // this.getUI('myLocationIcon').hide();
        // this.getUI('myLocationAjaxLoader').show();
        this.mapChannel.request('goto:myLocation');
    },
    onFilterClosedPlacesClick: function () {
        if (this.placeFilters.filterClosedPlaces) {
            this.placeFilters.filterClosedPlaces = false;
            this.placeFiltersChange();
            this.getUI('filterClosedPlaces').removeClass('active').attr('title', 'Dölj stängda platser');
        } else {
            this.placeFilters.filterClosedPlaces = true;
            this.placeFiltersChange();
            this.getUI('filterClosedPlaces').addClass('active').attr('title', 'Visa stängda platser');
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
