describe('Views :: SidebarView', function() {
	beforeEach(function(done) {
		var that = this;
		require(['views/SidebarView', 'models/Sidebar'], function(SidebarView, Sidebar) {
			that.view = new SidebarView();
			$("#sandbox").append(that.view.$el);
			that.model = that.view.model;
			done();
		});
	});
	
	it("should be invisible at first", function() {
		expect(this.view.$el.is('.open')).toEqual(false);
	});
	it("should open when model.open changes to true", function() {
		this.model.set('open', true);
		expect(this.view.$el.is('.open')).toEqual(true);
	});
	it("should close when model.open changes to false", function() {
		this.model.set('open', true);
		this.model.set('open', false);
		expect(this.view.$el.is('.open')).toEqual(false);
	});
});
