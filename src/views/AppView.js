import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import $ from 'jquery';
import Place from '../models/Place';
import MapView from './MapView';
import MenuBarView from './MenuBarView';
import SidebarView from './SidebarView';
import ModalView from './ModalView';

var AppView = Marionette.View.extend({
    channelName: 'appview',
    el: '#app',
    template: _.template($('#app-template').html()),
    regions: {
        map: '#map-wrapper',
        sidebar: {
            el: '#sidebar-container',
            replaceElement: true,
        },
        modal: '#modal-container',
        menubar: '.leaflet-control-container .leaflet-top.leaflet-left',
    },
    onRender: function() {
        this.showChildView('sidebar', new SidebarView({ newPlace: new Place() }));
        this.showChildView('modal', new ModalView());
        var mapView = new MapView({ collection: this.collection, sort: false });
        this.showChildView('map', mapView);
        this.showChildView('menubar', new MenuBarView({map: mapView.map, collection: this.collection}));
        this.bindEvents(Radio.channel('router'), {
            'home': this.render,
            'info': '',
            'place': '',
        });
        this.bindEvents(Radio.channel('menubar'), {
            'filter': this.getChildView('map').filterPlaces,
            'click:myLocation': this.getChildView('map').gotoMyLocation,
            'click:open:info': this.onOpenInfoClick,
            'click:open:addPlace': this.onOpenAddPlaceClick,
            'click:close:info click:close:addPlace': this.getChildView('sidebar').close,
        });
        this.bindEvents(Radio.channel('map'), {
            'place:open': this.onOpenPlaceClick,
            'place:close': this.getChildView('sidebar').close,
        });
        this.bindEvents(Radio.channel('sidebar'), {
            'close': this.onSidebarClose,
            'map-marker-click': this.getChildView('map').flyToPlace,
            'fully-open': this.getChildView('map').resize,
        });
    },
    onOpenInfoClick: function() {
        this.getChildView('sidebar').openInfo();
        this.getChildView('map').closePlace();
    },
    onOpenAddPlaceClick: function() {
        this.getChildView('sidebar').openAddPlace();
        this.getChildView('map').closePlace();
    },
    onOpenPlaceClick: function(place) {
        this.getChildView('menubar').deactivateButtons();
        this.getChildView('sidebar').openPlace(place);
    },
    onSidebarClose: function() {
        this.getChildView('menubar').deactivateButtons();
        this.getChildView('map').closePlace();
        this.getChildView('map').resize();
    },
});

export default AppView;
