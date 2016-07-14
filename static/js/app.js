var urlroot = '/';

require.config({
	waitSeconds : 120,
	paths : {
		'async' : '//cdnjs.cloudflare.com/ajax/libs/requirejs-async/0.1.1/async',
		'underscore' : '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
		'backbone' : '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min',
		'jquery' : '//code.jquery.com/jquery-3.1.0.min',
		'leaflet' : '//cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet',
		'leaflet-markerclusterer' : '//cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/0.5.0/leaflet.markercluster',
	},
	shim : {
		'underscore' : {
			exports : '_',
		},
		'backbone' : {
			deps : ['underscore', 'jquery'],
			exports : 'Backbone',
		},
		'leaflet' : {
			exports : 'L',
		},
		'leaflet-markerclusterer' : {
			deps : ['leaflet'],
		},
	},
});

require(['router', 'backbone'], function(Router, Backbone) {
	new Router();
	//Backbone.history.start();

	// Trigger the initial route and enable HTML5 History API support, set the
	// root folder to '/' by default.  Change in app.js.
	Backbone.history.start({
		pushState : true,
		root : urlroot
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
		var root = location.protocol + "//" + location.host + urlroot;

		// Ensure the root is part of the anchor href, meaning it's relative.
		if (href.prop.slice(0, root.length) === root) {
			// Stop the default event to ensure the link will not cause a page
			// refresh.
			evt.preventDefault();

			// `Backbone.history.navigate` is sufficient for all Routers and will
			// trigger the correct events. The Router's internal `navigate` method
			// calls this anyways.  The fragment is sliced from the root.
			Backbone.history.navigate(href.attr, true);
		}
	});
});