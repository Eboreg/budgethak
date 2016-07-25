define(['leaflet'], function(L) {
	return {
		urlroot : '/',
		zoom : 13,
		maxZoom : 18,
		maxClusterRadius : 15,
		defaultStartPos : [59.3219, 18.0720],
		popupImageWidth : 650,
		maxBeerPrice : 40,
		popupTop: 62, // hur långt popup ska ligga från fönsterkanten; uppdateras då #menu-bar-container renderas eller ändras
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