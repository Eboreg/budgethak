require.config({
	waitSeconds : 120,
	baseUrl : '/static', 
	paths : {
		'async' : '//cdnjs.cloudflare.com/ajax/libs/requirejs-async/0.1.1/async',
		'underscore' : '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
		'backbone' : '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min',
		'jquery' : '//code.jquery.com/jquery-3.1.0.min',
		'jquery-ui' : 'lib/jquery-ui-1.12.0.custom/jquery-ui',
		'leaflet' : '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0-rc.1/leaflet',
		'leaflet-markercluster' : '//cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.0.0-rc.1.0/leaflet.markercluster',
		'leaflet-usermarker' : 'lib/leaflet-usermarker/leaflet.usermarker',
		'router' : 'places/js/router',
		'utils' : 'places/js/utils',
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
		'leaflet' : {
			exports : 'L',
		},
		'leaflet-markercluster' : {
			deps : ['leaflet'],
		},
		'leaflet-usermarker' : {
			deps : ['leaflet'],
		},
	},
});

require(['router', 'backbone', 'utils'], function(Router, Backbone, utils) {
	new Router();

	// Trigger the initial route and enable HTML5 History API support, set the
	// root folder to '/' by default.  Change in app.js.
	Backbone.history.start({
		pushState : true,
		root : utils.urlroot
	});

	// All navigation that is relative should be passed through the navigate
	// method, to be processed by the router. If the link has a `data-bypass`
	// attribute, bypass the delegation completely.
	$(document).on("click", "a[href]:not([data-bypass])", function(evt) {
		// Get the absolute anchor href.
		var href = {
			prop : $(this).prop("href"),
			attr : $(this).attr("href")
		};
		// Get the absolute root.
		var root = location.protocol + "//" + location.host + utils.urlroot;

		// Ensure the root is part of the anchor href, meaning it's relative.
		if (href.prop.slice(0, root.length) === root) {
			// Stop the default event to ensure the link will not cause a page
			// refresh.
			evt.preventDefault();

			// `Backbone.history.navigate` is sufficient for all Routers and will
			// trigger the correct events. The Router's internal `navigate` method
			// calls this anyways.  The fragment is sliced from the root.
			Backbone.history.navigate(href.attr, true);
		} else {
			// Om extern länk: öppna alltid i nytt fönster
			evt.preventDefault();
			window.open(href.prop);
		}
	});
});