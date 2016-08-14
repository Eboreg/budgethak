describe('Views :: AppView', function() {
	beforeEach(function(done) {
		var that = this;
		require(['views/AppView', 'views/MapView', 'views/SidebarView', 'views/MenuBarView'], function(AppView, MapView, SidebarView, MenuBarView) {
//			spyOn(MapView.prototype, 'initialize').and.callFake(function() {});
			spyOn(MapView.prototype, 'initialize').and.callThrough();
			spyOn(SidebarView.prototype, 'initialize').and.callFake(function() {});
			spyOn(MenuBarView.prototype, 'initialize').and.callThrough();
			that.appview = new AppView();
			done();
		});
	});
	
	it("should create one MapView, one SidebarView and one MenuBarView", function(done) {
		require(['views/MapView', 'views/SidebarView', 'views/MenuBarView'], function(MapView, SidebarView, MenuBarView) {
			expect(MapView.prototype.initialize).toHaveBeenCalledTimes(1);
			expect(SidebarView.prototype.initialize).toHaveBeenCalledTimes(1);
			expect(MenuBarView.prototype.initialize).toHaveBeenCalledTimes(1);
			done();
		});
	});
	
	it("should render sidebarview, mapview and menubarview on this.render()", function(done) {
		var that = this;
		require(['views/MapView', 'views/SidebarView', 'views/MenuBarView'], function(MapView, SidebarView, MenuBarView) {
			spyOn(MapView.prototype, 'render').and.callFake(function() {});		
			spyOn(SidebarView.prototype, 'render').and.callFake(function() {});
			spyOn(MenuBarView.prototype, 'render').and.callFake(function() {});
			that.appview.render();
			$(_.bind(function() {
				expect(MapView.prototype.render).toHaveBeenCalledTimes(1);
				expect(SidebarView.prototype.render).toHaveBeenCalledTimes(1);
				expect(MenuBarView.prototype.render).toHaveBeenCalledTimes(1);
				done();
			}));
		});
	});
});
