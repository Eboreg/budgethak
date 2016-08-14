describe("Models :: Sidebar", function() {
	beforeEach(function(done) {
		var that = this;
		require(['models/Sidebar'], function(Sidebar) {
			that.sidebar = new Sidebar();
			done();
		});
	});
	
	it("should create a Sidebar model with correct default values", function() {
		expect(this.sidebar.get('infoOpen')).toBe(false);
		expect(this.sidebar.get('place')).toBe(null);
		expect(this.sidebar.get('open')).toBe(false);
		expect(this.sidebar.get('fullyOpen')).toBe(false);
		expect(this.sidebar.get('transition')).toBe(true);
	});
	
	it("should set open = true and place = null when infoOpen = true", function() {
		this.sidebar.set('infoOpen', true);
		expect(this.sidebar.get('open')).toBe(true);
		expect(this.sidebar.get('place')).toBe(null);
	});
	
	it("should set open = true and infoOpen = false when place = non-null object", function() {
		this.sidebar.set('place', { 'foo' : 'bar'});
		expect(this.sidebar.get('place')).toEqual({'foo' : 'bar'});
		expect(this.sidebar.get('open')).toBe(true);
		expect(this.sidebar.get('infoOpen')).toBe(false);
	});
	
	it("should have open = true, infoOpen = true and place = null after first opening place, then opening info without closing", function() {
		this.sidebar.set('place', {'foo' : 'bar'});
		this.sidebar.set('infoOpen', true);
		expect(this.sidebar.get('open')).toBe(true);
		expect(this.sidebar.get('place')).toBe(null);
		expect(this.sidebar.get('infoOpen')).toBe(true);
	});
	
	it("should have open = true, infoOpen = false and place = Object after first opening info, then opening place without closing", function() {
		this.sidebar.set('infoOpen', true);
		this.sidebar.set('place', {'foo' : 'bar'});
		expect(this.sidebar.get('open')).toBe(true);
		expect(this.sidebar.get('place')).toEqual({'foo' : 'bar'});
		expect(this.sidebar.get('infoOpen')).toBe(false);
	});
	
	it("should set open = false, place = null and infoOpen = false on call to method close()", function() {
		this.sidebar.set('infoOpen', true);
		this.sidebar.set('place', {'foo' : 'bar'});
		this.sidebar.close();
		expect(this.sidebar.get('place')).toBe(null);
		expect(this.sidebar.get('infoOpen')).toBe(false);
		expect(this.sidebar.get('open')).toBe(false);
	});
	
	it("should return correct values from method isOpen()", function() {
		expect(this.sidebar.isOpen()).toBe(false);
		this.sidebar.set('infoOpen', true);
		expect(this.sidebar.isOpen()).toBe(true);
		this.sidebar.set('place', {'foo' : 'bar'});
		expect(this.sidebar.isOpen()).toBe(true);
	});
});