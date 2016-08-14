describe("Models :: Place", function() {
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
		require(['models/Place'], function(Place) {
			that.place = new Place(mockData);
			done();
		});
	});
	
	it("should create a default Place model that is visible, not opened and has zIndex = 0", function() {
		expect(this.place).not.toBeNull();
		expect(this.place).not.toBeUndefined();
		expect(this.place.get('slug')).toBe('foo-bar');
		expect(this.place.get('name')).toBe('Foo Bar');
		expect(this.place.get('street_address')).toBe('Lillgatan 12');
		expect(this.place.get('city')).toBe('Stockholm');
		expect(this.place.get('lat')).toBe("59.3150478");
		expect(this.place.get('lng')).toBe("18.0756079");
		expect(this.place.get('beer_price')).toBe(35);
		expect(this.place.get('open_now')).toBe(true);
		expect(this.place.get('visible')).toBe(true);
		expect(this.place.get('opened')).toBe(false);
		expect(this.place.get('zIndex')).toBe(0);
	});
	
	it("should set zIndex = 1000 when opened changes to true", function() {
		this.place.set('opened', true);
		expect(this.place.get('zIndex')).toBe(1000);
	});

	it("should set zIndex = 0 when opened changes to false", function() {
		this.place.set('opened', true);
		this.place.set('opened', false);
		expect(this.place.get('zIndex')).toBe(0);
	});
	
	it("should set visible = false when not open and place.filter() called with options.openNow == true", function() {
		this.place.set('open_now', false);
		this.place.filter({ 'openNow' : true });
		expect(this.place.get('visible')).toBe(false);
	});

	it("should set visible = true when open and place.filter() called with options.openNow == true", function() {
		this.place.filter({ 'openNow' : true });
		expect(this.place.get('visible')).toBe(true);
	});

	it("should set visible = false when place.filter() called with options.maxBeerPrice == 30", function() {
		this.place.filter({ 'maxBeerPrice' : 30 });
		expect(this.place.get('visible')).toBe(false);
	});

	it("should set visible = true when place.filter() called with options.maxBeerPrice == 35", function() {
		this.place.filter({ 'maxBeerPrice' : 35 });
		expect(this.place.get('visible')).toBe(true);
	});
});
