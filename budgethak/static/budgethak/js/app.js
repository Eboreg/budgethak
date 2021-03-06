const debug = false;
const version = debug ? (new Date()).getTime() : "2018.4";

require.config({
	waitSeconds : 120,
	urlArgs: "v=" + version,
	//baseUrl : '/static', 
	paths : {
		'underscore' : [
			'//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
			'../../lib/underscore-min',
		],
		'backbone' : [
			'//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min',
			'../../lib/backbone-min',
		],
		'jquery' : [
			'//code.jquery.com/jquery-3.1.0.min',
			'../../lib/jquery-3.1.0.min',
		],
		'jquery-ui' : '../../lib/jquery-ui-1.12.0.custom/jquery-ui',
		'jquery-touchswipe' : [
			'//cdnjs.cloudflare.com/ajax/libs/jquery.touchswipe/1.6.18/jquery.touchSwipe.min',
			'../../lib/jquery.touchSwipe.min',
		],
		'jquery-timepicker' : [
			'//cdnjs.cloudflare.com/ajax/libs/jquery-timepicker/1.10.0/jquery.timepicker.min',
			'../../lib/jquery.timepicker.min',
		],
		'leaflet' : [
			'//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/leaflet',
			'../../lib/leaflet/leaflet',
		],
		'leaflet-markercluster' : [
			'//cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.3.0/leaflet.markercluster-src',
			'../../lib/leaflet.markercluster',
		],
		'urljs' : [
			'//cdnjs.cloudflare.com/ajax/libs/urljs/2.3.1/url.min',
			'../../lib/url.min',
		],
		'history' : [
			'//cdnjs.cloudflare.com/ajax/libs/history.js/1.8/bundled/html4+html5/native.history',
			'../../lib/native.history',
		],
		'leaflet-usermarker' : '../../lib/leaflet-usermarker/leaflet.usermarker',
		'router' : 'router',
		'settings' : 'settings',
		'ajaximage' : '../../ajaximage/js/ajaximage',
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
		'jquery-timepicker' : {
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
		'history': {
			exports : 'History',
		},
	},
});

var budgethak = budgethak || {};
require(['views/AppView', 'jquery', 'backbone', 'settings', 'router'], function(AppView, $, Backbone, settings) {
	$(function() {
		$.ajaxSetup({
			headers : { 'X-CSRFToken': $("[name='csrfmiddlewaretoken']").first().val() },
		});
	});

	//budgethak.router = new Router();
	//budgethak.appview = new AppView();
	//$(document.body).append(budgethak.appview.render().el);
	//$(document.body).append(budgethak.appview.el);
	$(document.body).append(AppView.el);

	// Trigger the initial route and enable HTML5 History API support, set the
	// root folder to '/' by default.  Change in app.js.
	Backbone.history.start({
		pushState : true,
		hashChange : false,
		root : settings.urlroot
	});

	//router.updateParams();

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
		var root = location.protocol + "//" + location.host + settings.urlroot;

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
