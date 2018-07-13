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
		collection : PlaceCollection,

		initialize: function () {
			this.model = MenuBar;
			_.bindAll(this, 'onMobileMenuButtonClick', 'onMyLocationClick', 'onFilterClosedPlacesClick', 'onSearchIconClick',
				'onInfoIconClick', 'setupAutocomplete', 'onMaxBeerPriceSliderChange');
			this.menuBar = L.control({
				position: 'topleft'
			});
			this.menuBar.onAdd = _.bind(function () {
				var template = _.template($("#menuBar").html());
				var $ret = $(template({
					'max_beer_price': this.model.get('maxBeerPrice')
				}));
				return $ret[0];
			}, this);
			this.listenTo(this.model, 'change:filterClosedPlaces', this.onFilterClosedPlacesChange);
			this.listenTo(this.model, 'change:infoActive', this.onInfoActiveChange);
			this.listenTo(this.model, 'change:mobileMenuOpen', this.onMobileMenuOpenChange);
		},
		render: function (map) {
			this.menuBar.addTo(map);
			this.$el = $("#menu-bar-container"); // Måste göra så eftersom elementet ej finns i DOM förrän nu
			var menuBarElement = this.menuBar.getContainer();
			// När maxpris-slider slide:as, ska text bredvid den uppdateras:
			var slideFunc = _.bind(function (event, ui) {
				this.$el.find("#max-beer-price").text(ui.value);
			}, this);
			L.DomEvent.disableClickPropagation(menuBarElement);
			L.DomEvent.disableScrollPropagation(menuBarElement);
			// Lägg till maxpris-slider och bind till event:
			this.$el.find("#max-beer-price-slider").slider({
				value: this.model.get('maxBeerPrice'),
				min: settings.minBeerPrice,
				max: settings.maxBeerPrice,
				step: settings.beerPriceSliderStep,
				slide: slideFunc,
				change: this.onMaxBeerPriceSliderChange,
			});
			if (this.model.get('infoActive'))
				this.$el.find("#info-icon").addClass("active");
			if (this.model.get('filterClosedPlaces')) {
				this.$el.find("#filter-closed-places-icon").addClass("active");
				this.$el.find("#filter-closed-places-icon").attr("title", "Visa stängda platser");
			}
			this.bindDOMEvents();
			return this;
		},
		// Verkar ej som om vi kan göra detta i vanliga events-hashen pga elementen finns ej DOM från början
		bindDOMEvents: function () {
			this.$el.find("#mobile-menu-button").click(this.onMobileMenuButtonClick);
			this.$el.find("#my-location-icon").click(this.onMyLocationClick);
			this.$el.find("#filter-closed-places-icon").click(this.onFilterClosedPlacesClick);
			this.$el.find("#search-icon").click(this.onSearchIconClick);
			this.$el.find("#info-icon").click(this.onInfoIconClick);
			// På mobiler ska sökfältet alltid synas när menyn är öppen
			if ($(window).width() > 600) {
				var transitionendFunc = _.bind(function (event) {
					if (event.originalEvent.propertyName == "width") {
						// searchFieldOpen är ett deskriptivt fält, inte något som events ska reagera på utan som bara ska kollas
						this.model.set("searchFieldOpen", !this.model.get("searchFieldOpen"));
						if (this.model.get("searchFieldOpen")) {
							this.$el.find("#search-field").focus();
						}
					}
				}, this);
				this.$el.find("#search-field-container").on("transitionend", transitionendFunc);
				this.$el.find("#search-field").focusout(_.bind(function () {
					this.closeSearchField();
				}, this));
			}
			this.setupAutocomplete();
		},
		openSearchField: function () {
			this.$el.find("#search-field-container").addClass("open");
		},
		closeSearchField: function () {
			this.$el.find("#search-field-container").removeClass("open");
		},
		setupAutocomplete: function () {
			var template = _.template($("#autocompleteItem").html());
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
			this.$el.find("#search-field").autocomplete({
				source: this.collection.autocomplete,
				minLength: 1,
				select: selectFunc,
			});
			this.$el.find("#search-field").focus(function () {
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
			this.trigger('info-icon-click');
		},

		/* MODELL-EVENTS */
		onFilterClosedPlacesChange: function (model, value) {
			if (value) {
				this.$el.find("#filter-closed-places-icon").addClass("active");
				this.$el.find("#filter-closed-places-icon").attr("title", "Visa stängda platser");
			} else {
				this.$el.find("#filter-closed-places-icon").removeClass("active");
				this.$el.find("#filter-closed-places-icon").attr("title", "Dölj stängda platser");
			}
		},
		onInfoActiveChange: function (model, value) {
			if (value)
				this.$el.find("#info-icon").addClass("active");
			else
				this.$el.find("#info-icon").removeClass("active");
		},
		onMobileMenuOpenChange: function (model, value) {
			if (value)
				this.$el.find(".menu-bar-row").css("display", "flex");
			else
				this.$el.find(".menu-bar-row").hide();
		},
	});
	return new MenuBarView();
});
