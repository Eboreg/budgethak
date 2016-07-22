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
	'collections/PlaceCollection'
], function(Backbone, _, L, markercluster, utils, PlaceView, UserPlaceView, $) {
	var MapView = Backbone.View.extend({
		el : '#map-element',
		// Vi kan inte använda events-hashen eftersom den behandlas före initialize(), varför ej map:* kommer att funka
		mapEvents : {
			'load' : 'mapReady'
		},
		filterClosedPlaces : false,
		placeviews : {},
	
		initialize : function(options) {
			_.bindAll(this, 'addPlace', 'cron30min', 'gotoMyPositionClicked', 'filterClosedPlacesClicked',
							'filterMaxBeerPriceChanged', 'mobileMenuButtonClicked', 'searchIconClicked', 'setupAutocomplete');
			this.listenTo(this.collection, 'add', this.addPlace);
			this.listenTo(this.collection, 'reset', this.addAllPlaces);
			// Kommer PlaceCollection alltid att vara färdig-bootstrappad när vi är här?
			this.addAllPlaces();
		},
		/* options.startpos : [startlng, startlat] */
		render : function(options) {
			options = options || {};
			options.startpos = options.startpos || utils.defaultStartPos;
			options.zoom = options.zoom || utils.zoom;
			this.map = L.map(this.el, {
				maxZoom : utils.maxZoom,
				zoomControl : false,
			});
			this.bindMapEvents();
			this.map.setView(options.startpos, options.zoom);
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			}).addTo(this.map);
			this.addMenuBar();
			window.setInterval(this.cron30min, 60000);
			return this;
		},
		// Körs av routern när plats angivits i URL:en
		showPlace : function(slug) {
			var model = this.collection.get(slug);
			if (typeof model != "undefined") {
				// placeview:render:(slug) triggas av this.mapReady och händer alltså alltid efter render()
				this.once('placeview:render:'+slug, function() {
					this.trigger('showplace:'+slug);
				});
				this.render({ startpos : [model.get('lat'), model.get('lng')], zoom : 17 });
			} else {
				this.render();
			} 
		},
		// Triggas av load-event från map 
		// Körs alltså alltid efter this.render()
		mapReady : function() {
			this.markercluster = L.markerClusterGroup({
				maxClusterRadius : utils.maxClusterRadius,
			});
			this.map.addLayer(this.markercluster);
			new UserPlaceView({
				mapview : this,
			});
			_.each(this.placeviews, function(placeview) {
				this.listenToOnce(placeview, 'render', function(id) {
					this.trigger('placeview:render:'+id);
				});
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

		// Om vi bootstrappar in alla modeller via collection.reset(), triggas aldrig "add"
		addAllPlaces : function() {
			this.collection.forEach(this.addPlace);
		},
		// Skapande av markör och tillägg av denna i this.markercluster sker i PlaceView::render()
		addPlace : function(model) {
			var placeview = new PlaceView({
				model : model,
				mapview : this,
			});
//			placeview.render();
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
		searchIconClicked : function() {
			$("#search-field-container").toggle('fast', this.setupAutocomplete);
			$("#search-field").focus();
		},
		setupAutocomplete : function() {
			if ($("#search-field").css("display") != "none") {
				var template = _.template($("#autocompleteItem").html());
				$("#search-field").autocomplete({
					source : this.collection.autocomplete,
					minLength : 1,
					select : function(event, ui) {
						console.log(event, ui);
					},
				}).autocomplete("instance")._renderItem = function(ul, item) {
					return $(template(item)).appendTo(ul); 
				};
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

