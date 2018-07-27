define([
	'backbone',
], function(Backbone) {
	var Sidebar = Backbone.Model.extend({
		defaults : {
			infoOpen : false,
			addPlaceOpen : false,
			place : null,  // innehåller model för plats som är "öppen"
			open : false,
			fullyOpen : false, // ändras först efter transistionend-event
			transition : true,
		},
		initialize : function() {
			this.on({
				'change:infoOpen' : this.onInfoOpenChange,
				'change:addPlaceOpen' : this.onAddPlaceOpenChange,
				'change:place' : this.onPlaceChange,
			}, this);
		},
		close : function() {
			this.set('infoOpen', false);
			this.set('place', null);
		},
		isOpen : function() {
			return (this.get('infoOpen') || this.get('addPlaceOpen') || (this.get('place') !== null));
		},
		onInfoOpenChange : function(model, value) {
			if (true === value) {
				this.set('place', null);
				this.set('addPlaceOpen', false);
			}
			this.set('open', this.isOpen());
		},
		onAddPlaceOpenChange : function(model, value) {
			if (true === value) {
				this.set('place', null);
				this.set('infoOpen', false);
			}
			this.set('open', this.isOpen());
		},
		onPlaceChange : function(model, value) {
			if (null !== value) {
				this.set('infoOpen', false);
				this.set('addPlaceOpen', false);
			}
			this.set('open', this.isOpen());
		},
	});
	return new Sidebar();
});
