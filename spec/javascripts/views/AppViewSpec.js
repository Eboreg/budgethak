var budgethak = budgethak || {};
budgethak.router = { navigate : function() {} };
describe('Views :: AppView', function() {
	var mockData = {
		"slug":"foo-bar",
		"name":"Foo Bar",
		"street_address":"Lillgatan 12",
		"city":"Stockholm",
		"lat":"59.3150478",
		"lng":"18.0756079",
		"beer_price":35,
		"open_now":true
	};
	
	beforeEach(function(done) {
		var that = this;
		budgethak.bootstrap = [ mockData ];
		require(['views/AppView', 'views/MapView', 'views/SidebarView', 'views/MenuBarView'], function(AppView, MapView, SidebarView, MenuBarView) {
//			spyOn(MapView.prototype, 'initialize').and.callFake(function() {});
			spyOn(MapView.prototype, 'initialize').and.callThrough();
			//spyOn(SidebarView.prototype, 'initialize').and.callFake(function() {});
			spyOn(SidebarView.prototype, 'initialize').and.callThrough();
			spyOn(MenuBarView.prototype, 'initialize').and.callThrough();
			that.appview = new AppView();
			done();
		});
	});
	
	afterEach(function(done) {
		this.appview.mapview.remove();
		this.appview.sidebarview.remove();
		this.appview.menubarview.remove();
		this.appview.remove();
		$(done);
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
	
	it("should open correct sidebar when place marker clicked", function(done) {
		var that = this;
		$(function() {
			that.appview.placeviews['foo-bar'].marker.fire('click');
			expect(that.appview.sidebarview.model.get('place')).toEqual(that.appview.collection.get('foo-bar'));
			expect(that.appview.sidebarview.model.get('open')).toEqual(true);
			done();
		});
	});
});
