define([
	'backbone',
	'underscore',
	'models/MenuBar',
	'collections/PlaceCollection',
	'settings',
	'leaflet',
	'jquery',
	'jquery-ui',
], function (Backbone, _, MenuBar, PlaceCollection, settings, L, $) {
	var MenuBarView = Backbone.View.extend({
		initialize: function () {
			this.model = MenuBar;
			_.bindAll(this, 'onMobileMenuButtonClick', 'onMyLocationClick', 'onFilterClosedPlacesClick', 'onSearchIconClick',
				'onInfoIconClick', 'onAddPlaceIconClick', 'setupAutocomplete', 'onMaxBeerPriceSliderChange');
			this.menuBar = L.control({
				position: 'topleft'
			});
			this.menuBar.onAdd = _.bind(function () {
				var template = _.template($("#menu-bar").html());
				var $ret = $(template({
					'max_beer_price': this.model.get('maxBeerPrice')
				}));
				return $ret[0];
			}, this);
			this.listenTo(this.model, 'change:filterClosedPlaces', this.onFilterClosedPlacesChange);
			this.listenTo(this.model, 'change:infoActive', this.onInfoActiveChange);
			this.listenTo(this.model, 'change:addPlaceActive', this.onAddPlaceActiveChange);
			this.listenTo(this.model, 'change:mobileMenuOpen', this.onMobileMenuOpenChange);
		},
		render: function (map) {
			this.menuBar.addTo(map);
			this.$el = $("#menu-bar-container"); // Måste göra så eftersom elementet ej finns i DOM förrän nu
			var menuBarElement = this.menuBar.getContainer();
			// När maxpris-slider slide:as, ska text bredvid den uppdateras:
			var slideFunc = _.bind(function (event, ui) {
				this.$("#max-beer-price").text(ui.value);
			}, this);
			L.DomEvent.disableClickPropagation(menuBarElement);
			L.DomEvent.disableScrollPropagation(menuBarElement);
			// Lägg till maxpris-slider och bind till event:
			this.$("#max-beer-price-slider").slider({
				value: this.model.get('maxBeerPrice'),
				min: settings.minBeerPrice,
				max: settings.maxBeerPrice,
				step: settings.beerPriceSliderStep,
				slide: slideFunc,
				change: this.onMaxBeerPriceSliderChange,
			});
			if (this.model.get('infoActive'))
				this.$("#info-icon").addClass("active");
			if (this.model.get('filterClosedPlaces')) {
				this.$("#filter-closed-places-icon").addClass("active");
				this.$("#filter-closed-places-icon").attr("title", "Visa stängda platser");
			}
			this.bindDOMEvents();
			return this;
		},
		// Verkar ej som om vi kan göra detta i vanliga events-hashen pga elementen finns ej DOM från början
		bindDOMEvents: function () {
			this.$("#mobile-menu-button").click(this.onMobileMenuButtonClick);
			this.$("#my-location-icon").click(this.onMyLocationClick);
			this.$("#filter-closed-places-icon").click(this.onFilterClosedPlacesClick);
			this.$("#search-icon").click(this.onSearchIconClick);
			this.$("#info-icon").click(this.onInfoIconClick);
			this.$("#add-place-icon").click(this.onAddPlaceIconClick);
			// På mobiler ska sökfältet alltid synas när menyn är öppen
			if ($(window).width() > 600) {
				var transitionendFunc = _.bind(function (event) {
					if (event.originalEvent.propertyName == "width") {
						// searchFieldOpen är ett deskriptivt fält, inte något som events ska reagera på utan som bara ska kollas
						this.model.set("searchFieldOpen", !this.model.get("searchFieldOpen"));
						if (this.model.get("searchFieldOpen")) {
							this.$("#search-field").focus();
						}
					}
				}, this);
				this.$("#search-field-container").on("transitionend", transitionendFunc);
				this.$("#search-field").focusout(_.bind(function () {
					this.closeSearchField();
				}, this));
			}
			this.setupAutocomplete();
		},
		openSearchField: function () {
			this.$("#search-field-container").addClass("open");
		},
		closeSearchField: function () {
			this.$("#search-field-container").removeClass("open");
		},
		setupAutocomplete: function () {
			var template = _.template($("#autocomplete-item").html());
			var selectFunc = _.bind(function (event, ui) {
				this.closeSearchField();
				this.trigger('autocomplete-select', ui.item.id);
			}, this);
			$.widget('ui.autocomplete', $.ui.autocomplete, {
				_renderItem: function (ul, item) {
					return $(template(item)).appendTo(ul);
				},
				_resizeMenu: function () {
					var maxHeight = $(document).height() - $("#search-field").offset().top - $("#search-field").height() - 10;
					this.menu.element.css('max-height', maxHeight);
				},
			});
			this.$("#search-field").autocomplete({
				source: PlaceCollection.autocomplete,
				minLength: 1,
				select: selectFunc,
			});
			this.$("#search-field").focus(function () {
				$(this).autocomplete("search");
			});
		},

		/* UI-EVENTS */
		onMaxBeerPriceSliderChange: function (event, ui) {
			this.model.set('maxBeerPrice', ui.value);
			this.trigger('max-beer-price-change', ui.value); // Fångas av AppViews
		},
		onMobileMenuButtonClick: function () {
			this.model.set('mobileMenuOpen', !this.model.get('mobileMenuOpen'));
		},
		onMyLocationClick: function () {
			this.trigger('my-location-click');
		},
		onFilterClosedPlacesClick: function () {
			this.model.set('filterClosedPlaces', !this.model.get('filterClosedPlaces'));
			this.trigger('filter-closed-places-click', this.model.get('filterClosedPlaces'));
		},
		onSearchIconClick: function () {
			if (this.model.get("searchFieldOpen") == false) {
				this.openSearchField();
			}
		},
		onInfoIconClick: function () {
			this.model.set('infoActive', !this.model.get('infoActive'));
		},
		onAddPlaceIconClick: function() {
			this.model.set('addPlaceActive', !this.model.get('addPlaceActive'));
		},

		/* MODELL-EVENTS */
		onFilterClosedPlacesChange: function (model, value) {
			if (value) {
				this.$("#filter-closed-places-icon").addClass("active");
				this.$("#filter-closed-places-icon").attr("title", "Visa stängda platser");
			} else {
				this.$("#filter-closed-places-icon").removeClass("active");
				this.$("#filter-closed-places-icon").attr("title", "Dölj stängda platser");
			}
		},
		onInfoActiveChange: function (model, value) {
			if (value)
				this.$("#info-icon").addClass("active");
			else
				this.$("#info-icon").removeClass("active");
		},
		onAddPlaceActiveChange : function(model, value) {
			if (value)
				this.$("#add-place-icon").addClass("active");
			else 
				this.$("#add-place-icon").removeClass("active");
		},
		onMobileMenuOpenChange: function (model, value) {
			if (value)
				this.$(".menu-bar-row").css("display", "flex");
			else
				this.$(".menu-bar-row").hide();
		},
	});
	return new MenuBarView();
});
