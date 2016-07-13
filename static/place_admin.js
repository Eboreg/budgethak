// Används ej f.n.
function loadOSM() {
	var map = L.map('admin_map', {
		zoomControl : false,
	}).setView([59.3219, 18.0720], 13);
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map);

	var geocoder = L.control.geocoder('search-UiteMRc', {
		focus : true,
		expanded : true,
	});
	geocoder.addTo(map);
	geocoder.on('select', function(e) {
		console.log(e);
		$("#id_lat").val(e.latlng.lat);
		$("#id_lng").val(e.latlng.lng);
		$("#id_street_address").val(e.feature.properties.name);
		if (typeof e.feature.properties.neighbourhood != 'undefined')
			$("#id_neighbourhood").val(e.feature.properties.neighbourhood);
		$("#id_city").val(e.feature.properties.locality);
	});
/*
	var geosearch = new L.Control.GeoSearch({ provider : new L.GeoSearch.Provider.Google() });
	geosearch.addTo(map);
*/
}

django.jQuery(function($) {
	function loadGoogleMap() {
		var map = new google.maps.Map(document.getElementById('admin_map'), {
			center : { lat: 59.3219, lng: 18.0720 },
			zoom : 13,
			mapTypeControl : false,
		});
		var input = document.getElementById('pac-input');
		var marker = new google.maps.Marker();
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
		input.onclick = function() { this.select(); };
		var autocomplete = new google.maps.places.Autocomplete(input, {
			componentRestrictions : { country : 'se' },
		});
	    autocomplete.bindTo('bounds', map);
	    autocomplete.addListener('place_changed', function() {
			place_data = autocomplete.getPlace();
			var street_address = getAddressComponent(place_data.address_components, 'route');
			var street_number = getAddressComponent(place_data.address_components, 'street_number');
			$("#id_street_address").val(street_address+' '+street_number);
			$("#id_city").val(getAddressComponent(place_data.address_components, 'postal_town'));
	    	if (-1 === place_data.types.indexOf('street_address')) {
	    		$("#id_name").val(place_data.name);
	    	}
	    	$("#id_lat").val(place_data.geometry.location.lat());
	    	$("#id_lng").val(place_data.geometry.location.lng());
	    	if (place_data.opening_hours && place_data.opening_hours.periods) {
	    		var opening_hours = new Array();
	    		var period;
	    		var j = 0;
				// Google tycker att söndag == dag 0, vi tycker dag 6.
				// Om första dagen är söndag, lägg den sist:
				if (place_data.opening_hours.periods[0].open.day === 0) {
					var sunday = place_data.opening_hours.periods.shift();
					place_data.opening_hours.periods.push(sunday);
				}
	    		for (var i = 0; i < place_data.opening_hours.periods.length; i++) {
	    			period = place_data.opening_hours.periods[i];
    				opening_hours[j] = {
    					start_weekday : period.open.day === 0 ? 6 : period.open.day-1,
    					end_weekday : period.open.day === 0 ? 6 : period.open.day-1,
    					opening_time : period.open.time.substr(0, 2)+':'+period.open.time.substr(2, 2),
    					closing_time : period.close.time.substr(0, 2)+':'+period.close.time.substr(2, 2),
    				};
					// Om öppettider för denna dag är samma som för dagen innan, foga samman dem:
    				if (j > 0 && opening_hours[j-1].opening_time === opening_hours[j].opening_time
    					 && opening_hours[j-1].closing_time === opening_hours[j].closing_time
    					 && opening_hours[j-1].end_weekday === (opening_hours[j].start_weekday - 1)) {
    					 opening_hours[j-1].end_weekday = opening_hours[j].start_weekday;
    					 opening_hours.pop();
    				} else {
    					j++;
    				}
	    		}
	    		for (i = 0; i < opening_hours.length; i++) {
	    			$("#id_openinghours_set-"+i+"-start_weekday").val(opening_hours[i].start_weekday);
	    			$("#id_openinghours_set-"+i+"-end_weekday").val(opening_hours[i].end_weekday);
	    			$("#id_openinghours_set-"+i+"-opening_time").val(opening_hours[i].opening_time);
	    			$("#id_openinghours_set-"+i+"-closing_time").val(opening_hours[i].closing_time);
	    		}
	    		console.log(opening_hours);
	    	}
			map.setOptions({
				center : place_data.geometry.location,
				zoom : 16,
			});
			marker.setOptions({
				map : map,
				position : place_data.geometry.location,
			});
	    	console.log(place_data);
	    	return false;
	    });
	}

	function getAddressComponent(address_components, key) {
		for (var i = 0; i < address_components.length; i++) {
			if (-1 !== address_components[i].types.indexOf(key)) {
				return address_components[i].long_name;
			}
		}
		return "";
	}
	
	// Submitta ej formuläret vid enter i autocompleterutan
	$("#pac-input").on('keypress', function(e) {
		return e.which !== 13;
	});
	loadGoogleMap();
});
