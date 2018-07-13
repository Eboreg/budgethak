/**
 * Lyssnar efter: Backbone:info-sidebar-clicked
 * Triggar: Backbone:info-sidebar-open, Backbone:info-sidebar-closed
 */
define([
	'backbone',
	'underscore',
	'jquery',
	'models/Sidebar',
	'models/Place',
	'jquery-touchswipe',
], function(Backbone, _, $, Sidebar) {
	var SidebarView = Backbone.View.extend({
		//el : '#sidebar-container',
		id : 'sidebar-container',
		className : 'w3-card-8',
		events : {
			'transitionend' : 'onTransitionEnd',
			'click #place-map-marker' : 'onMapMarkerClick',
			'click #close-sidebar-button' : 'onCloseButtonClick',
		},
		infoTemplate : _.template($("#infoText").html()),
		placeTemplate : _.template($("#placeText").html()),
		place : null,
		
		initialize : function() {
			this.model = Sidebar;
			this.$el.append('<div id="sidebar-element" class="w3-container"></div>');
			_.bindAll(this, 'onMapMarkerClick', 'onCloseButtonClick');
			this.listenTo(this.model, 'change:open', this.onOpenChange);
			this.listenTo(this.model, 'change:infoOpen', this.onInfoOpenChange);
			this.listenTo(this.model, 'change:place', this.onPlaceChange);
			if ($(window).width() <= 600) {
				this.$el.swipe({
					swipeRight : _.bind(function() {
						this.model.close();
					}, this),
				});
			}
		},
		
		// Anropas av this.onOpenChange() efter signal från modell
		// addClass() sätter igång CSS-transition, efter vilken 'transitionend' triggas 
		open : function() {
			this.$el.show();
			// Elementet har från början ej klass "transition" eftersom den då blir felcentrerad om url = place/:id
			if (this.model.get('transition')) {
				this.$el.addClass('transition');
			} else {
				this.model.set('fullyOpen', true);
				this.trigger('fully-open');
				if (null !== this.model.get('place'))
					this.trigger('place-fully-open', this.model.get('place'));
			}
			this.$el.addClass('open');
			this.model.set('transition', true);
			this.trigger('open');
		},
		// Anropas av this.onOpenChange() efter signal från modell
		// removeClass() sätter igång CSS-transition, efter vilken 'transitionend' triggas 
		close : function() {
			this.$el.removeClass('open');
			this.trigger('close');
		},
		openInfo : function() {
			this.$el.find("#sidebar-element").html(this.infoTemplate());
			this.place = null;
			this.trigger('info-open');
		},
		// Stänger inte själva rutan
		closeInfo : function() {
			this.trigger('info-close');
		},
		openPlace : function() {
			if (this.place != this.model.get('place')) {
				if (this.place !== null) { 
					this.closePlace();
				}
				this.place = this.model.get('place');
				this.listenToOnce(this.place, 'sync', this.onPlaceModelSync);
				this.place.fetch();
				this.$el.find("#sidebar-element").html('<h3>Hämtar data ...</h3>');
			} 
			this.trigger('place-open', this.place);
		},
		// Stänger inte själva rutan
		closePlace : function() {
			this.stopListening(this.place);
			this.trigger('place-close', this.place);
		},

		/* DOM-EVENTS */
		onTransitionEnd : function() {
			this.model.set('fullyOpen', this.model.get('open'));
			this.trigger('transitionend');
			if (this.model.get('fullyOpen')) {
				this.trigger('fully-open');
				if (null !== this.model.get('place'))
					this.trigger('place-fully-open', this.model.get('place'));
			} else {
				// Har förekommit på mobil att det går att skrolla till den stängda sidebaren 
				// om den bara ligger utanför viewporten utan att vara dold
				this.$el.hide();
			}
		},
		onCloseButtonClick : function() {
			this.trigger('close-button-click');
			this.model.close();
		},
		onMapMarkerClick : function() {
			this.trigger('map-marker-click', this.place);
		},

		/* MODELL-EVENTS */
		onOpenChange : function(model, value) {
			if (value)
				this.open();
			else
				this.close();
		},
		onInfoOpenChange : function(model, value) {
			if (value)
				this.openInfo();
			else
				this.closeInfo();
		},
		// Reagerar när this.model.place pekas om på null eller ny platsmodell
		onPlaceChange : function(model, value) {
			if (null === value) {
				this.closePlace();
			} else {
				this.openPlace();
			}
		},
		// Triggas av model:sync (en gång). 
		onPlaceModelSync : function(model) {
			this.onPlaceModelChange(model);
    		this.listenTo(model, 'change', this.onPlaceModelChange);
		},
		// Triggas av model:change (tills platsinfo stängts). 
		// Reagerar på förändringar i själva modellen som this.model.place pekar på.
		onPlaceModelChange : function(model) {
			if (!model.get('visible')) {
				this.closePlace();
				this.model.close();
			} else {
				this.$el.find("#sidebar-element").html(this.placeTemplate(model.toJSON()));
			}
		},
	});
	return new SidebarView();
});
