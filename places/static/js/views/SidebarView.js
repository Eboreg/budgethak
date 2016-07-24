/**
 * Lyssnar efter: Backbone:info-sidebar-clicked
 * Triggar: Backbone:info-sidebar-open, Backbone:info-sidebar-closed
 */
define([
	'backbone',
	'underscore',
	'jquery',
	'models/Place',
], function(Backbone, _, $) {
	var SidebarView = Backbone.View.extend({
		el : '#sidebar-container',
		events : {
			'info-opened' : 'placeClosed',
			'place-opened' : 'infoClosed',
		},
		isOpen : false,
		infoOpen : false,
		placeOpen : false,  // innehåller model för plats som är "öppen"
		infoTemplate : _.template($("#infoText").html()),
		placeTemplate : _.template($("#placeText").html()),
		
		initialize : function() {
			_.bindAll(this, 'togglePlace', 'triggerOpenOrClose', 'placeOpened', 'mapMarkerClicked', 'close');
			this.$el.on('transitionend', this.triggerOpenOrClose);
			this.$el.on('click', '#place-map-marker', this.mapMarkerClicked);
			this.$el.on('click', '#close-sidebar-button', this.close);
		},
		/**
		 * open*() och close*() sköter själva öppnandet och stängandet av elementet samt ifyllande av data.
		 * *opened() och *closed() gör sådant som ska göras när resp. element öppnats/stängts (trigga event, starta/stoppa
		 * 	lyssnare m.m.)
		 */
		open : function() {
			this.isOpen = true;
			// Elementet har från början ej klass "transition" eftersom den då blir felcentrerad om url = place/:id
			this.$el.addClass('transition');
			this.$el.addClass('open');
		},
		openWithoutTransition : function() {
			this.isOpen = true;
			this.$el.addClass('open');
			this.trigger('open');
		},
		// removeClass() sätter igång CSS-transition, efter vilken 'transitionend' triggas och this.triggerOpenOrClose() körs
		close : function() {
			this.infoClosed();
			this.placeClosed();
			this.isOpen = false;
			this.$el.removeClass('open');
		},
		openInfo : function() {
			this.$el.find("#sidebar-element").html(this.infoTemplate());
			this.open();
			this.infoOpened();
		},
		closeInfo : function() {
			this.close();
			this.infoClosed();
		},
		infoOpened : function() {
			this.infoOpen = true;
			this.placeClosed();
			this.trigger('info-opened');
		},
		// Körs av closeInfo() och triggas även av 'place-opened'
		infoClosed : function() {
			if (this.infoOpen) {
				this.infoOpen = false;
				this.trigger('info-closed');
			}
		},
		openPlace : function(model) {
			if (this.placeOpen != model) {
				this.listenToOnce(model, 'sync', this.updatePlaceInfo);
	    		this.listenTo(model, 'change', this.updatePlaceInfo);
				model.fetch();
				this.$el.find("#sidebar-element").html('<h3>Hämtar data ...</h3>');
				// Om sidebar redan är öppen, kommer ingen transition att ske, så trigga eventet direkt:
				if (this.isOpen) {
					this.placeOpened(model);
				} else {
					var triggerFunc = _.bind(function() {
						this.placeOpened(model);
					}, this);
					this.$el.one('transitionend', triggerFunc);
				}
				this.open();
			} else {
				this.placeOpened(model);
			}
		},
		placeOpened : function(model) {
			this.infoClosed();
			this.placeClosed();  // förra platsen är ju stängd
			this.placeOpen = model;
			this.trigger('place-opened', model);
		},
		closePlace : function() {
			this.close();
			// this.placeClosed() triggar 'place-closed'
			this.placeClosed();
		},
		// Triggas av 'info-opened' eftersom öppnande av info nödvändigt innebär att plats stängs (om sådan varit öppen)
		placeClosed : function() {
			if (this.placeOpen) {
				this.stopListening(this.placeOpen);
				this.trigger('place-closed', this.placeOpen);
				this.placeOpen = false;
			}
		},
		// Triggas från Router
		togglePlace : function(model) {
			// Om denna plats ej är öppen, ska den öppnas; annars stängas
			if (this.placeOpen != model) {
				this.openPlace(model);
			} else {
				this.closePlace();
			}
		},
		toggleInfo : function() {
			if (!this.infoOpen) {
				this.openInfo();
			} else {
				this.closeInfo();
			}
		},
		// Triggas av model:sync (en gång) och model:change (tills platsinfo stängts)
		updatePlaceInfo : function(model) {
			this.$el.find("#sidebar-element").html(this.placeTemplate(model.toJSON()));
		},
		triggerOpenOrClose : function() {
			if (this.isOpen)
				this.trigger('open');
			else
				this.trigger('close');
		},
		mapMarkerClicked : function() {
			this.trigger('map-marker-click', this.placeOpen);
		},
	});
	return SidebarView;
});
