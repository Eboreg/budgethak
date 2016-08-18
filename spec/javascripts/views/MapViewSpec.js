describe("Views :: MapView", function() {
	beforeEach(function(done) {
		var that = this;
		require(["views/MapView"], function(MapView) {
			that.mapview = new MapView();
			that.mapview.listenToOnce(that.mapview.model, 'change:rendered', function() {
				done();
			});
			that.mapview.render();
		});
	});
	
	afterEach(function() {
		this.mapview.model.destroy();
		this.mapview.map.remove();
		this.mapview.remove();
	});
	
	it("should pan to user position on first discovery", function(done) {
		var that = this;
		require(["leaflet"], function(L) {
			spyOn(that.mapview.map, 'flyTo');
			var latlng = L.latLng(50, 30);
			that.mapview.model.set("userLocation", { latlng : latlng, accuracy : 1 });
			expect(that.mapview.map.flyTo).toHaveBeenCalledWith(latlng, 17);
			done();
		});
	});
	
	it("should move user location icon when user location changes", function(done) {
		var that = this;
		require(["leaflet"], function(L) {
			var latlng = L.latLng(50, 30);
			that.mapview.model.set("userLocation", { latlng : latlng, accuracy : 1 });
			latlng.lat = 51;
			var func = function() {
				that.mapview.model.set("userLocation", { latlng : latlng, accuracy : 1 });
				expect(that.mapview.userMarker.getLatLng()).toEqual(latlng);
				done();
			};
			if (!that.mapview.model.get("userMarkerSet")) {
				that.mapview.listenToOnce(that.mapview.model, 'change:userMarkerSet', func);
			} else {
				func();
			}
		});
	});
});
