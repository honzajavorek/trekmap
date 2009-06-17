
/**
 * Basic class, driver factory.
 */
function TrekMap(id, provider) {
    if (undefined === window.jQuery) {
		throw new Error('jQuery has to be loaded.');
	}
    switch (provider) {
		case 'google':
			// launching
			launcher = function() { (new GoogleTrekMap()).init(id); }
			if (undefined === window.google) jQuery(document).ready(launcher);
			else google.setOnLoadCallback(launcher);
			
			// preventing memory leaks
			window.onunload = GUnload;
			break;

		case 'seznam':
		    jQuery(document).ready( function() { (new SeznamTrekMap()).init(id); } );
            break;

		case 'atlas':
		    // mootools
		    window.addEvent('domready', function() { (new AtlasTrekMap()).init(id); } );
            break;
		default:
		    throw new Error('There is no support for "' + provider + '" map provider.');
	}
}

/**
 * Google driver.
 */
function GoogleTrekMap(id) {
	if (undefined === GMap2) {
        throw new Error('Google Maps APIv2 has to be loaded.');
	}
	this.provider = 'google';

	this.init = function(id) {
	    var map = new GMap2(document.getElementById(id));
		map.setCenter(new GLatLng(49.2, 16.616667), 15); // center
		map.setUIToDefault(); // UI
	}
}

/**
 * Seznam driver.
 */
function SeznamTrekMap(id) {
	if (undefined === SMap) {
        throw new Error('Mapy API v4.0 has to be loaded.');
	}
	this.provider = 'seznam';
	
	this.init = function(id) {
	    center = new SMap.Coord(0, 0);
	    center.fromWGS84(16.616667, 49.2);
		var map = new SMap(document.getElementById(id), center, 13, {
			minZoom: 5,
			maxZoom: 13
		});
		map.addDefaultLayer(SMap.DEF_TURIST).enable();
		map.addDefaultControls();
	}
}

/**
 * Atlas driver.
 */
function AtlasTrekMap(id) {
	if (undefined === AMap) {
        throw new Error('AMapy API has to be loaded.');
	}
	this.provider = 'atlas';
	
	this.init = function(id) {
        var map = new AMap('map');
        map.loadMaps(new AGeoPoint(49.2, 16.616667, ACoordinateSystem.Geodetic), 23400, 'Turistická');
        map.addMapPart(new ASmallMapControl());
        map.addMapPart(new AMapTypeControl());
        alert(map.getCurrentScale());
	}
}
