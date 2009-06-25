/**
 * Map engine.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */

// MooTools required, AMapy required
if (undefined === window.MooTools || undefined === window.AMap) { throw new Error('MooTools and/or AMapy are undefined.'); }
// php is global variable with some basic config and info from server side
if (!$defined(php)) { throw new Error('Global variable php is undefined.'); }

var trekmap = {

	/**
	 * Clicked points.
	 */
	points: [],

	/**
	 * Rendered lines.
	 */
	lines: {
		forth: null,
		back: null
	},

	/**
	 * Measuring unit.
	 */
	unit: {
		ratio: 1000, // from meters
		label: 'km'
	},

	/**
	 * Total kilometers.
	 */
	meters: 0,
	
	/**
	 * Array of milestones.
	 */
	milestones: [],
	
	/**
	 * Supersimple debugging tool.
	 */
	debug: function(msg) {
		new Element('span').setText(msg + ' ').injectTop(document.body);
	}
	
};

/**
 * Busy/ready status of map.
 */
trekmap.busy = {
	/**
	 * Busy status.
	 */
	isset: false,
	
	/**
	 * Changing status.
	 */
	set: function(val) {
		var map = $('trekmap');
		
		if (!$defined($('trekmap-busy'))) { // transparent film to prevent clicking on map
			new Element('div', {id: 'trekmap-busy'}).setStyles({
			 	position: 'absolute', top: 0, left: 0, 'z-index': 999,
			 	width: map.getStyle('width'), height: map.getStyle('height')
			}).injectInside(map);
		}
		
		if (val) { // busy
			trekmap.busy.isset = true; // has to be first!
			$('trekmap-busy').setStyle('display', 'block');
			new Fx.Style(map, 'opacity').set(0.50);
		} else { // ready
			$('trekmap-busy').setStyle('display', 'none');
			new Fx.Style(map, 'opacity').set(1);
			trekmap.busy.isset = false; // has to be last!
		}
	}
}

/**
 * Line management.
 */
trekmap.line = {
	/**
	 * Color forth.
	 */
	color1: '#222222',
	
	/**
	 * Color back.
	 */
	color2: '#666666',
	
	/**
	 * Width of line.
	 */
	width: '4px',
	
	/**
	 * Opacity of line.
	 */
	opacity: 1,
	
	/**
	 * Cleares map canvas.
	 */
	clear: function() {
		if (trekmap.lines.forth != null) {
			trekmap.lines.forth.remove();
			trekmap.lines.forth = null;
		}
		if (trekmap.lines.back != null) {
			trekmap.lines.back.remove();
			trekmap.lines.back = null;
		}
	},
	
	/**
	 * Updates all lines on map.
	 */
	update: function(points) {
		trekmap.line.clear(); // clearing
		if (trekmap.points.length <= 1) return; // minimum 2 points

		var A, B, breakpoint; // border points, breakpoint
		var k, d; // ratio, distance
		var total = 0; // distance collector
		var half = trekmap.meters / 2; // half of the way
		
		var forth = [];
		var back = [];
		
		for (var i = 0; i < trekmap.points.length; i++) {
			if (i + 1 != trekmap.points.length) { // if it isn't last point
				A = trekmap.points[i].coords.convertTo(ACoordinateSystem.S42);
				B = trekmap.points[i + 1].coords.convertTo(ACoordinateSystem.S42);
				
				d = B.distanceFrom(A);
				total += d;
			}
			
			if (total < half) { // less then half
				forth.push(trekmap.points[i].coords);
			} else {
				if (back.length < 1) {
					// similarity of triangles
					k = (d - (total - half)) / d; // ratio
					// breakpoint
					breakpoint = new AGeoPoint(
						(k * (B.x - A.x)) + A.x,
						(k * (B.y - A.y)) + A.y,
						ACoordinateSystem.S42
					);
					
					forth.push(trekmap.points[i].coords);
					forth.push(breakpoint);
					back.push(breakpoint);
				} else {
					back.push(trekmap.points[i].coords);
				}
			}
		}
		
		// way forth
		trekmap.lines.forth = new APolyline(forth, {
			color: this.color1,
			weight: this.width,
			opacity: this.opacity
		});
		trekmap.map.addOverlay(trekmap.lines.forth);
		
		// way back
		trekmap.lines.back = new APolyline(back, {
			color: this.color2,
			weight: this.width,
			opacity: this.opacity
		});
		trekmap.map.addOverlay(trekmap.lines.back);
	}
};
	
/**
 * Menu actions listening on buttons and changing the map.
 */
trekmap.actions = {
	/**
	 * Clearing the map.
	 */
	clear: {
		validate: function() {
			return (trekmap.points.length > 0);
		},
		process: function() {
			if (trekmap.actions.clear.validate() && window.confirm('Opravdu smazat vše na mapě?')) { // TODO dialog
				trekmap.map.removeAllOverlays();
				trekmap.map.removeAllMarkers();
				trekmap.points = [];
				trekmap.lines = { forth: null, back: null };
		        trekmap.update();
			}
		}
	},
	
	/**
	 * Delete last point.
	 */
	undo: {
		validate: function() {
			return (trekmap.points.length > 0);
		},
		process: function() {
			if (trekmap.actions.undo.validate()) {
				if (trekmap.points.length == 2) {
			        trekmap.points.pop();
				}
				trekmap.points.pop();
				trekmap.update();
			}
		}
	},
	
	/**
	 * Helper.
	 */
	firstSameAsLast: function() {
		if (trekmap.points.length > 0) {
			return (trekmap.points[0].coords == trekmap.points[trekmap.points.length - 1].coords);
		}
		return true;
	},
	
	/**
	 * Finish polygon to create a loop.
	 */
	finishLoop: {
		validate: function () { return !trekmap.actions.firstSameAsLast(); },
		process: function() {
			if (trekmap.actions.finishLoop.validate()) {
				var p = { coords: trekmap.points[0].coords };
				if ($defined(trekmap.points[0].altitude)) {
					p.altitude = trekmap.points[0].altitude;
				}
			    trekmap.points.push(p);
		        trekmap.update();
			}
		}
	},
	
	/**
	 * Finish polygon to go by the same way back.
	 */
	sameWayBack: {
		validate: function () { return !trekmap.actions.firstSameAsLast(); },
		process: function() {
			if (trekmap.actions.sameWayBack.validate()) {
				var pts = [], p;
				for (var i = 0; i < trekmap.points.length; i++) {
					p = { coords: trekmap.points[i].coords };
					if ($defined(trekmap.points[i].altitude)) {
						p.altitude = trekmap.points[i].altitude;
					}
					pts.push(p);
				}
				pts.pop();
				pts.reverse();
				trekmap.points = trekmap.points.concat(pts);
				trekmap.update();
			}
		}
	}
};

/**
 * Editation menu.
 */
trekmap.menu = {
	/**
	 * Menu open/closed as true/false.
	 */
	status: false,
	
	/**
	 * To show menu.
	 */
	show: function() {
	    trekmap.menu.hide();
	    var menu = new Element('fieldset', {id: 'trekmap-menu-fieldset'}).injectInside($('trekmap-menu'));
	    
	    // buttons
		var a = trekmap.actions;
		var btns = [
			{text: 'Vymazat', action: a.clear },
			{text: 'Zpět', action: a.undo },
			{text: 'Spojit do okruhu', action: a.finishLoop },
			{text: 'Stejnou cestou zpět', action: a.sameWayBack }
		];
	
	 	// events
		for (var i = 0; i < btns.length; i++) {
	        btn = new Element('button')
				.setText(btns[i].text)
				.injectInside(menu);
	        btn.addEvent('click', btns[i].action.process);
	
			if ($defined(btns[i].action.validate)) { // can be validated?
				if (!btns[i].action.validate()) { // disabled?
					btn.setProperty('disabled', 'disabled');
				}
			}
		}
	
	    trekmap.menu.status = true;
		return menu;
	},
	
	/**
	 * To hide the menu.
	 */
	hide: function() {
		if ($defined($('trekmap-menu-fieldset'))) {
			$('trekmap-menu-fieldset').remove();
		}
		trekmap.menu.status = false;
	},
	
	/**
	 * Toggle menu.
	 */
	toggle: function() {
		(trekmap.menu.status)? trekmap.menu.hide() : trekmap.menu.show();
	}
};
/**
 * Update (redraw) menu.
 */
trekmap.menu.update = trekmap.menu.show;

/**
 * Mode manipulation.
 */
trekmap.mode = {
	/**
	 * Mode of map, view/design.
	 */
	status: 'view',
		
	/**
	 * Set menu mode.
	 */
	set: function(mode) {
		switch (mode) {
			case 'view':
			    $('trekmap-toggle-mode').setText('Upravovat');
			    trekmap.menu.hide();
			    break;
			    
			case 'design':
			    $('trekmap-toggle-mode').setText('Prohlížet');
			    trekmap.menu.show();
			    break;
			    
			default:
				throw new Error('Unknown map mode.');
		}
		
	    trekmap.mode.status = mode;
		trekmap.map.update();
	},
	
	/**
	 * Toggle menu mode.
	 */
	toggle: function() {
		trekmap.mode.set((trekmap.mode.status == 'view')? 'design' : 'view');
	}
};

/**
 * Distance management.
 */
trekmap.distance = {
	/**
	 * Label icon.
	 */
	label: new AIcon({
		imageSrc: null,
		shadowSrc: null,
		fastRollover: false,
		imageSize: null,
		iconOffset: new APoint(0, 0),
		labelStyle: 'display: inline; white-space: nowrap; padding: 2px 5px; float: left; text-align: left; background-color: #393939; color: #FFF; font: bold 9px Tahoma;',
		labelOffset: new APoint(0, 0),
		className: 'milestone',
		opacity: 0.65
	}),
	
	/**
	 * Dot icon.
	 */
	dot: new AIcon({
		imageSrc: php.baseUri + 'img/dot.gif', // TODO
		shadowSrc: null,
		fastRollover: false,
		imageSize: new ASize(22, 27),
		iconOffset: new APoint(0, 0),
	}),
	
	/**
	 * Total distance count in kilometers.
	 */
	update: function() {
		el = $('trekmap-total-distance');
		
		if (trekmap.points.length > 1) {
			for(var i = 0; i < trekmap.points.length; i++) { // checking if all points have meters
				if (!$defined(trekmap.points[i].meters)) { // if not set from before
					trekmap.points[i].meters = (i != 0)?
						 trekmap.points[i - 1].meters + trekmap.points[i].coords.distanceFrom(trekmap.points[i - 1].coords)
						 : trekmap.points[i].meters = 0;
				}
			}
			trekmap.meters = trekmap.points[trekmap.points.length - 1].meters; // the last one
		} else {
			trekmap.meters = 0;
		}
		
		el.setText((trekmap.meters / trekmap.unit.ratio).toFixed(2)); // in kilometers
		trekmap.distance.milestones();
	},
	
	/**
	 * Clear milestones.
	 */
	clear: function() {
		for (var i = 0; i < trekmap.milestones.length; i++) {
			trekmap.milestones[i][0].remove();
			trekmap.milestones[i][1].remove();
		}
	},
	
	/**
	 * Scale and interval detection.
	 */
	getInterval: function() {
		if (!$defined(trekmap.map)) return false;
		var scale = Math.ceil(trekmap.map.getCurrentScale() / 100000);
		if (scale < 2) interval = 1;
		else if (scale < 6) interval = 5;
		else if (scale < 11) interval = 10;
		else if (scale < 26) interval = 25;
		else interval = 50;
		return interval * trekmap.unit.ratio; // in meters
	},
	
	/**
	 * Manage milestones.
	 */
	milestones: function() {
		if (!$defined(trekmap.map)) return;
		trekmap.distance.clear(); // clearing current markers
		if (!$('trekmap-milestones').checked) return; // milestones turned off
		if (trekmap.points.length <= 1) return;
		
		var interval = trekmap.distance.getInterval(); // interval detection
		
		var count = 0; // count of milestones on map
		var rest = 0; // rest from previous segment
		
		var i, j; // iterators
		var A, B; // border points of segment
		var d, n, k, distances, target, stone;
		
		for (i = 1; i < trekmap.points.length; i++) { // iterating segments
			A = trekmap.points[i - 1].coords.convertTo(ACoordinateSystem.S42); // border point A
			B = trekmap.points[i].coords.convertTo(ACoordinateSystem.S42); // border point B

			d = B.distanceFrom(A); // segment distance in meters
			distances = []; // milestone distances
			
			if (rest > 0) { // rest from previous segment
				if (rest > d) { // rest is longer than whole segment
					rest -= d;
					continue; // skip to next segment
				} else {
					distances.push(rest);
				}
			}

			n = Math.floor((d - rest) / interval); // number of following markers on segment
			for (j = 0; j < n; j++) { // adding following distances
				distances.push(rest + interval * (j + 1));
			}
			
			// now we have prepared distances of markers on this segment
			for (j = 0; j < distances.length; j++) { // iterating distances
				// similarity of triangles
				k = distances[j] / d; // ratio
				// point of marker
				target = new AGeoPoint(
					(k * (B.x - A.x)) + A.x,
					(k * (B.y - A.y)) + A.y,
					ACoordinateSystem.S42
				);
				
				count++; // counting
				
				// stone
				stone = [
					new AMarker(target, {
						icon: trekmap.distance.label,
						label: Math.round(count * (interval / trekmap.unit.ratio)) + ' ' + trekmap.unit.label
					}),
					new AMarker(target, {
						icon: trekmap.distance.dot,
					})
				];
				
				// puting into map
				trekmap.map.addOverlay(stone[0]);
				trekmap.map.addOverlay(stone[1]);
				
				// saving in stack
				trekmap.milestones.push(stone);
			}
			
			// rest
			rest = interval - (d - ((distances.length > 0)? distances.pop() : 0));
		}
	}
};

/**
 * Altitude functions.
 */
trekmap.altitude = {
	/**
	 * Weight of chart.
	 */
	width: 500,
	
	/**
	 * Height of chart.
	 */
	height: 100,
	
	/**
	 * Color of chart line.
	 */
	color: '#197B30',
	
	/**
	 * Temporary API script tag.
	 */
	api: null,
	
	/**
	 * Batch processing.
	 */
	batch: false,
	
	/**
	 * Index of point to be affected.
	 */
	p: null,
	
	/**
	 * Calls GeoNames API for altitude data.
	 */
	get: function(pointIndex) {
		if (trekmap.altitude.api != null) return; // busy
		if (pointIndex == null) throw new Error('No point defined for getting altitude.');
				
		// point, coordinates
		trekmap.altitude.p = pointIndex;
		var coords = trekmap.points[pointIndex].coords.convertTo(ACoordinateSystem.Geodetic);
		
		// lock map
		trekmap.busy.set(true);
		
		// api
		var uri = 'http://ws.geonames.org/gtopo30JSON?lat=' + escape(coords.x) + '&lng=' + escape(coords.y) + '&callback=trekmap.altitude.load';	
		trekmap.altitude.api = new Element('script', {src: uri}).injectTop(document.body);
	},
	
	/**
	 * Load point data from GeoNames.
	 */
	load: function(result) {
		trekmap.points[trekmap.altitude.p].altitude = result.gtopo30;
		
		// clear script tag and index of affected point
		trekmap.altitude.api.remove();
		trekmap.altitude.api = trekmap.altitude.p = null;
		
		// unlock map
		if (!trekmap.altitude.batch) {
			trekmap.busy.set(false);
		}
	},
	
	/**
	 * Cleares the chart.
	 */
	clear: function() {
		$('trekmap-altitude-chart').setStyles({
			width: '0',
			height: '0',
			background: 'none'
		});
	},
	
//	encoding: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.',
//	
//	/**
//	 * Encodes values for the chart.
//	 */
//	encode: function(val) {
//		var numericVal = new Number(val);
//		var encoding = trekmap.altitude.encoding;
//		
//		if(isNaN(numericVal)) {
//			throw new Error('Non-numeric value submitted.');
//		} else if (numericVal < 0 || numericVal > encoding.length * encoding.length - 1) {
//			throw new Error('Value outside permitted range');
//		}
//		var quotient = Math.floor(numericVal / encoding.length);
//		var remainder = numericVal - encoding.length * quotient;
//		return encoding.charAt(quotient) + encoding.charAt(remainder);
//	},
	
	/**
	 * Checkes points and replenishes altitude data at once.
	 */
	replenish: function() {
		trekmap.busy.set(true); // lock map
		trekmap.altitude.batch = true; // batch processing
		
		var readyAndAllDefined = (trekmap.altitude.api == null); // ready?
		if (readyAndAllDefined) { // yes, ready
			for (var i = 0; i < trekmap.points.length; i++) {
				if (!$defined(trekmap.points[i].altitude)) {
					readyAndAllDefined = false;
					
					// get altitude
					trekmap.altitude.get(i);
					
					break;
				}
			}
		}
		
		if (!readyAndAllDefined) {
			setTimeout('trekmap.altitude.update()', 5); // recursion, try again after some time
		} else {
			trekmap.altitude.batch = false; // batch processing
			trekmap.busy.set(false); // unlock map
		}
		return readyAndAllDefined;
	},
	
	/**
	 * Creates the chart.
	 */
	chart: function() {
		if (!$defined(trekmap.map)) return;
		trekmap.altitude.clear();
		if (!$('trekmap-altitude').checked) return; // chart turned off
		if (trekmap.points.length <= 1) return;
		if (!trekmap.altitude.replenish()) return; // replenish missing values (until not replenished, terminate)
		
		var i, kms = '', kmMax = 0, alts = '', altMax = 0;
		
		// searching for maximum altitude and maximum kilometers
		for (i = 0; i < trekmap.points.length; i++) {
			altMax = Math.max(altMax, trekmap.points[i].altitude);
		}
		altMax = Math.ceil(altMax / 100) * 100;
		kmMax = Math.round(trekmap.meters / trekmap.unit.ratio);
		
		// percents of altitude and percents of kilometers
		for (i = 0; i < trekmap.points.length; i++) {
			alts += ((trekmap.points[i].altitude * 100) / altMax).toFixed(2) + ',';
			kms += (((trekmap.points[i].meters / trekmap.unit.ratio) * 100) / kmMax).toFixed(2) + ',';
		}

		var w = trekmap.altitude.width, h = trekmap.altitude.height;
		var uri = 'http://chart.apis.google.com/chart?chxt=x,y&chxr=0,0,' + kmMax + '|1,0,' + altMax + '&cht=lxy&chd=t:' + kms.slice(0, -1) + '|' + alts.slice(0, -1) + '&chs=' + w + 'x' + h + '&chco=' + trekmap.altitude.color.slice(1) + '&chls=1,1,0';
		$('trekmap-altitude-chart').setStyles({
			width: w + 'px',
			height: h + 'px',
			background: 'url(\'' + uri + '\') center no-repeat'
		});
	},
	
	/**
	 * Fetches altitude of single point after click.
	 */
	fetch: function() {
		if (!$('trekmap-altitude').checked) return; // chart turned off
		trekmap.altitude.get(trekmap.points.length - 1); // last added point
	}
	
};
trekmap.altitude.update = trekmap.altitude.chart;

/**
 * Click handler.
 */
trekmap.click = function(object, coords) {
	if (!trekmap.busy.isset && trekmap.mode.status == 'design') {
        trekmap.points.push({ 'coords': coords });
        trekmap.altitude.fetch(); // fetches altitude of last added point
        trekmap.update();
    }
};

/**
 * Updates whole trekmap.
 */
trekmap.update = function() {
	if (!trekmap.busy.isset) {
		trekmap.distance.update();
		trekmap.line.update();
	    trekmap.menu.update();
	   	trekmap.altitude.update();
	   	trekmap.map.update();
	} else {
		setTimeout('trekmap.update()', 5);
	}
}

/**
 * Initialization.
 */
window.addEvent('domready', function () { if ($defined($('trekmap'))) {
	// limit scales
	A_NORMAL_MAP.scaleInfos.splice(0, 3);
	A_PHOTO_MAP.scaleInfos.splice(0, 6);

    // core map instance
	var map = new AMap('trekmap', {
        showAtlasLogo: false,
        mapCursor: 'crosshair',
        onClick: trekmap.click,
        onScaleChanged: trekmap.distance.milestones
	});

	// load maps
	map.loadMaps(new AGeoPoint(3546969, 5521970, ACoordinateSystem.S42), 0); // Czech Republic

	// controls
    map.addMapPart(new AMapTypeControl());
    map.addMapPart(new AMapLayerControl([A_CYCLE_MAP, A_TOURISTIC_MAP]));
    map.addMapPart(new ASmallMapControl());
    
    // menu
    $('trekmap-toggle-mode').addEvent('click', trekmap.mode.toggle);
    $('trekmap-milestones').addEvent('click', trekmap.distance.update);
    $('trekmap-altitude').addEvent('click', trekmap.altitude.update);
    $('trekmap-total-distance').setText((0).toFixed(2));
    
    // trekmap
    trekmap.map = map;
    trekmap.mode.set('view'); // initialize mode
} });
