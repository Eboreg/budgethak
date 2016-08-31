// Får skriva dit kod som lägger till nödvändiga template-block i DOM.

require.config({
	waitSeconds : 120,
	baseUrl : '/__src__/places/static/js', 
	paths : {
		'underscore' : [
			'//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
			'/__src__/lib/underscore-min',
		],
		'backbone' : [
			'//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min',
			'/__src__/lib/backbone-min',
		],
		'jquery' : [
			'//code.jquery.com/jquery-3.1.0.min',
			'/__src__/lib/jquery-3.1.0.min',
		],
		'jquery-ui' : '/__src__/lib/jquery-ui-1.12.0.custom/jquery-ui',
		'jquery-touchswipe' : [
			'//cdnjs.cloudflare.com/ajax/libs/jquery.touchswipe/1.6.18/jquery.touchSwipe.min',
			'../lib/jquery.touchSwipe.min',
		],
		'leaflet' : [
			'//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0-rc.1/leaflet',
			'/__src__/lib/leaflet/leaflet',
		],
		'leaflet-markercluster' : [
			'//cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.0.0-rc.1.0/leaflet.markercluster',
			'/__src__/lib/leaflet.markercluster',
		],
		'urljs' : [
			'//cdnjs.cloudflare.com/ajax/libs/urljs/2.3.1/url.min',
			'/__src__/lib/url.min',
		],
		'leaflet-usermarker' : '/__src__/lib/leaflet-usermarker/leaflet.usermarker',
		'router' : 'router',
		'settings' : 'settings',
	},
	shim : {
		'underscore' : {
			exports : '_',
		},
		'backbone' : {
			deps : ['underscore', 'jquery'],
			exports : 'Backbone',
		},
		'jquery-ui' : {
			deps : ['jquery'],
		},
		'jquery-touchswipe' : {
			deps : ['jquery'],
		},
		'leaflet' : {
			exports : 'L',
		},
		'leaflet-markercluster' : {
			deps : ['leaflet'],
		},
		'leaflet-usermarker' : {
			deps : ['leaflet'],
		},
		'urljs' : {
			exports : 'Url',
		},
	},
});

require(['jquery'], function($) {
	$(document.body).append('<script id="infoText" type="text/template"><p></p></script>');
	$(document.body).append('<script id="placeText" type="text/template"><p></p></script>');
	$(document.body).append('<script id="menuBar" type="text/template"><p></p></script>');
	$(document.body).append('<script id="autocompleteItem" type="text/template"><p></p></script>');
	$(document.body).append('<div id="sandbox" style="display:none"></div>');
});

