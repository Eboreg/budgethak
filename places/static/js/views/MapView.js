/**
 * Vyn har direkt kännedom om modellen då det ej finns anledning att ha någon Collection (vi använder bara en karta).
 * Förändringar i geolocation räknas som en användarinteraktion och tas omhand här.
 * 
 * Properties
 * el : kartelementet
 * model : sunkhak.Map (används ännu bara för att ange defaultvärden; kan ej hämta eller lagra några data någonstans)
 * map : 
 * mapEvents : lyssnar efter events på 'map'
 * collection : PlaceCollection (sätts av router.js)
 * 
 * Events:
 * 	Backbone.'mapview:map:idle' : UserPlaceView ritar ut användarmarkör (om position finns)
 */
define([
	'backbone',
	'underscore',
	'leaflet',
	'leaflet-markercluster',
	'utils',
	'views/PlaceView',
	'views/UserPlaceView',
	'jquery',
	'jquery-ui',
	'collections/PlaceCollection',
	'views/SidebarView', // Ska fixa tillbaka AppView och anropa den där istället
], function(Backbone, _, L, markercluster, utils, PlaceView, UserPlaceView, $) {
	var MapView = Backbone.View.extend({
		el : '#map-element',
		// Vi kan inte använda events-hashen eftersom den behandlas före initialize(), varför ej map:* kommer att funka
		mapEvents : {
			'load' : 'mapReady',
			'click' : 'mapClicked',
		},
		filterClosedPlaces : false,
		mapRendered : false,
		placeviews : {},
	
		initialize : function(options) {
			_.bindAll(this, 'addPlace', 'cron30min', 'gotoMyPositionClicked', 'filterClosedPlacesClicked', 'infoIconClicked',
							'filterMaxBeerPriceChanged', 'mobileMenuButtonClicked', 'searchIconClicked', 'setupAutocomplete');
			this.listenTo(this.collection, 'add', this.addPlace);
			this.listenTo(this.collection, 'reset', this.addAllPlaces);
			// Kommer PlaceCollection alltid att vara färdig-bootstrappad när vi är här?
			this.addAllPlaces();
			this.map = L.map(this.el, {
				maxZoom : utils.maxZoom,
				zoomControl : false,
				attributionControl : false,
			});
			this.bindMapEvents();
			this.addMenuBar();
			window.setInterval(this.cron30min, 60000);
			$("#search-field-container").focusout(this.hideSearchField);
		},
		/* options.startpos : [startlng, startlat] */
		render : function(options) {
			options = options || {};
			options.startpos = options.startpos || utils.defaultStartPos;
			options.zoom = options.zoom || utils.zoom;
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(this.map);
			L.control.attribution({
				position : 'bottomleft',
			}).addAttribution('Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>')
				.addTo(this.map);
			// Triggar map:load som kör this.mapReady():
			this.map.setView(options.startpos, options.zoom);
			return this;
		},
		reloadMapSize : function() {
			this.map.invalidateSize({ pan : false });
		},
		// fullZoom = bool
		panTo : function(latlng, fullZoom) {
			fullZoom = fullZoom || false;
			if (!fullZoom)
				this.map.flyTo(latlng);
			else
				this.map.flyTo(latlng, 17);
		},
		panToIfOutOfBounds : function(latlng) {
			var bounds = this.map.getBounds();
			if (!bounds.contains(latlng)) {
				this.map.flyTo(latlng);
			}
		},
		zoomInFull : function() {
			this.map.setZoom(17);
		},

		// Triggas av load-event från map 
		// Körs alltså alltid efter this.render()
		mapReady : function() {
			this.mapRendered = true;
			this.markercluster = L.markerClusterGroup({
				maxClusterRadius : utils.maxClusterRadius,
			});
			this.map.addLayer(this.markercluster);
			new UserPlaceView({
				mapview : this,
			});
			_.each(this.placeviews, function(placeview) {
				placeview.render();
			}, this);
		},
		// Kallas av this.render()
		addMenuBar : function() {
			this.menuBar = L.control({
				position : 'topleft',
			});
			this.menuBar.onAdd = function(map) {
				var template = _.template($("#menuBar").html());
				return $(template({ 'max_beer_price' : utils.maxBeerPrice }))[0];
			};
			this.menuBar.addTo(this.map);
			var menuBarElement = this.menuBar.getContainer();
			utils.popupTop = menuBarElement.offsetTop + menuBarElement.offsetHeight + 5;
			L.DomEvent.disableClickPropagation(menuBarElement);
			L.DomEvent.disableScrollPropagation(menuBarElement);
			$("#mobile-menu-button").click(this.mobileMenuButtonClicked);
			$("#my-location-icon").click(this.gotoMyPositionClicked);
			$("#filter-closed-places-icon").click(this.filterClosedPlacesClicked);
			$("#filter-closed-places-checkbox").change(this.filterClosedPlacesClicked);
			$("#search-icon").click(this.searchIconClicked);
			$("#info-icon").click(this.infoIconClicked);
			$("#max-beer-price-slider").slider({
				value : 40,
				min : 20,
				max : utils.maxBeerPrice,
				step : 5,
				slide : function(event, ui) {
					$("#max-beer-price").text(ui.value);
				},
				change : this.filterMaxBeerPriceChanged,
			});
		},

		// Om vi bootstrappar in alla modeller via collection.reset(), triggas aldrig "add" utan bara "reset"
		addAllPlaces : function() {
			this.collection.forEach(this.addPlace);
		},
		// Skapande av markör och tillägg av denna i this.markercluster sker i PlaceView::render()
		addPlace : function(model) {
			var placeview = new PlaceView({
				model : model,
				mapview : this,
			});
			this.placeviews[model.id] = placeview;
		},
		// options.maxBeerPrice == maxpris på öl
		// options.openNow == true om sådant filter ska tillämpas
		filter : function(options) {
			this.trigger('filter', options);
		},
		cron30min : function() {
			var d = new Date();
			if (d.getMinutes() % 30 === 0) {
				this.collection.fetch();
				this.filter({ openNow : this.filterClosedPlaces });
			}
		},

		/*
		 * ANVÄNDARINTERAKTIONER
		 */
		// Klickat någonstans på kartan men ej på en marker
		mapClicked : function() {
			this.trigger('map:click');
		},
		infoIconClicked : function() {
			this.trigger('info-icon-clicked');
		},
		// Triggas av SidebarView:info-opened via Router
		activateInfoIcon : function() {
			$("#info-icon").addClass("active");
		},
		// Triggas av SidebarView:close från Router
		deactivateInfoIcon : function() {
			$("#info-icon").removeClass("active");
		},
		searchIconClicked : function() {
			if ($("#search-field-container").css('display') == 'none') {
				$("#search-field-container").show('fast', this.setupAutocomplete);
				$("#search-field").focus();
			} else {
				$("#search-field-container").hide('fast', this.setupAutocomplete);
			}
		},
		hideSearchField : function() {
			$("#search-field-container").hide('fast');
			$("#search-field").val("");
		},
		setupAutocomplete : function() {
			if ($("#search-field").css("display") != "none") {
				var template = _.template($("#autocompleteItem").html());
				var selectFunc = function(event, ui) {
					this.hideSearchField();
					this.trigger('autocomplete-select', ui.item.id);
				};
				selectFunc = _.bind(selectFunc, this);
				$.widget('ui.autocomplete', $.ui.autocomplete, {
					_renderMenu : function(ul, items) {
						var that = this;
						$.each(items, function(index, item) {
							if (index < 10)
								that._renderItemData(ul, item);
						});
					},
					_renderItem : function(ul, item) {
						return $(template(item)).appendTo(ul);
					},
				});
				$("#search-field").autocomplete({
					source : this.collection.autocomplete,
					minLength : 1,
					select : selectFunc,
				});
			}
		},
		mobileMenuButtonClicked : function() {
			if ($(".menu-bar-row").first().css('display') == 'none') {
				$(".menu-bar-row").show('fast').css('display', 'flex');
			} else {
				$(".menu-bar-row").hide('fast');
			}
		},
		filterMaxBeerPriceChanged : function(event, ui) {
			this.filter({ maxBeerPrice : ui.value });
		},
		filterClosedPlacesClicked : function() {
			this.filterClosedPlaces = !this.filterClosedPlaces;
			this.filter({ openNow : this.filterClosedPlaces });
			// Om stängda platser döljs:
			if (this.filterClosedPlaces) {
				$("#filter-closed-places-icon").addClass("active");
				$("#filter-closed-places-icon").attr("title", "Visa stängda platser");
			}
			else {
				$("#filter-closed-places-icon").removeClass("active");
				$("#filter-closed-places-icon").attr("title", "Dölj stängda platser");
			}
		},
		gotoMyPositionClicked: function() {
			this.trigger("goto-my-position-clicked");
		},

		/**
		 * Delegerar alla Leaflet-events till View-events med namn 'map:<leaflet-eventnamn>'.
		 * Binder även explicit angivna lyssnare till Leaflet-events via this.mapEvents.
		 */
		bindMapEvents : function() {
			var mapEventNames = [
				'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'contextmenu', 'focus', 
				'blur', 'preclick', 'load', 'unload', 'viewreset', 'movestart', 'move', 'moveend', 'dragstart', 'drag',
				'dragend', 'zoomstart', 'zoomend', 'zoomlevelschange', 'resize', 'autopanstart', 'layeradd', 'layerremove',
				'baselayerchange', 'overlayadd', 'overlayremove', 'locationfound', 'locationerror', 'popupopen', 'popupclose'
			];
			_.each(mapEventNames, function(mapEventName) {
				var handler = function() {
					//console.log('map:'+mapEventName);
					this.trigger('map:'+mapEventName);
				};
				handler = _.bind(handler, this);
				this.map.on(mapEventName, handler);
			}, this);
			_.each(this.mapEvents, function(handler, event) {
				handler = _.isString(handler) ? this[handler] : handler;
				if (_.isFunction(handler)) {
					handler = _.bind(handler, this);
					this.map.on(event, handler);
				}
			}, this);
		},
	});
	return MapView;
});

