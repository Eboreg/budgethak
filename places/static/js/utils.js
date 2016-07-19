define(['leaflet'], function(L) {
	return {
		urlroot : '/',
		zoom : 13,
		maxZoom : 18,
		maxClusterRadius : 15,
		defaultStartPos : [59.3219, 18.0720],
		infoWindowImageWidth : 750,
		placeIcon : L.icon({
			iconUrl : '/media/beermug.png',
			iconSize : [30, 28.234],
			shadowUrl : '/media/beermug-shadow.png',
			shadowSize : [45, 28.234],
			shadowAnchor : [15, 15],
		}),
	};
});
