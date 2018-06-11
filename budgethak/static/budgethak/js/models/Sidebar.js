define([
	'backbone',
], function(Backbone) {
	var Sidebar = Backbone.Model.extend({
		defaults : {
			infoOpen : false,
			place : null,  // innehåller model för plats som är "öppen"
			open : false,
			fullyOpen : false, // ändras först efter transistionend-event
			transition : true,
		},
		initialize : function() {
			this.on({
				'change:infoOpen' : this.onInfoOpenChange,
				'change:place' : this.onPlaceChange,
			}, this);
		},
		close : function() {
			this.set('infoOpen', false);
			this.set('place', null);
		},
		isOpen : function() {
			return (this.get('infoOpen') || (this.get('place') !== null));
		},
		onInfoOpenChange : function() {
			if (true === this.get('infoOpen'))
				this.set('place', null);
			this.set('open', this.isOpen());
		},
		onPlaceChange : function() {
			if (null !== this.get('place'))
				this.set('infoOpen', false);
			this.set('open', this.isOpen());
		},
	});
	return Sidebar;
});
