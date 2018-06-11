define(['leaflet'], function(L) {
	return {
		urlroot : '/',
		maxZoom : 17,
		maxClusterRadius : 15,
		maxBeerPrice : 40,
		placeIcon : L.icon({
			iconUrl : '/media/beermug-dark.png',
			iconSize : [30, 28.234],
			shadowUrl : '/media/beermug-shadow.png',
			shadowSize : [45, 28.234],
			shadowAnchor : [15, 15],
		}),
		placeIconActive : L.icon({
			iconUrl : '/media/beermug.png',
			iconSize : [40, 37.645],
			shadowUrl : '/media/beermug-shadow.png',
			shadowSize : [47.814, 37.645],
			shadowAnchor : [15, 20],
		}),
	};
});
