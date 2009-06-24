/**
 * Map engine.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */

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
	milestones: []
	
};

/**
 * Line management.
 */
trekmap.line = {
	color1: '#F4552B',
	color2: '#F59A2C',
	width: '4px',
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
	update: function(points) { // TODO dodelat barvu jinak ... tak, aby si vypocitala kilometricky stred trasy a tam se zmenila na svetlejsi oranzovou
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
				A = trekmap.points[i].convertTo(ACoordinateSystem.S42);
				B = trekmap.points[i + 1].convertTo(ACoordinateSystem.S42);
				
				d = B.distanceFrom(A);
				total += d;
			}
			
			if (total < half) { // less then half
				forth.push(trekmap.points[i]);
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
					
					forth.push(trekmap.points[i]);
					forth.push(breakpoint);
					back.push(breakpoint);
				} else {
					back.push(trekmap.points[i]);
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
				trekmap.lines = [];
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
	 * Finish polygon to create a loop.
	 */
	finishLoop: {
		validate: function() {
			var firstSameAsLast = (trekmap.points[0] == trekmap.points[trekmap.points.length - 1]);
			return (!firstSameAsLast && trekmap.points.length > 0);
		},
		process: function() {
			if (trekmap.actions.finishLoop.validate()) {
			    trekmap.points.push(trekmap.points[0]);
		        trekmap.update();
			}
		}
	},
	
	/**
	 * Finish polygon to go by the same way back.
	 */
	sameWayBack: {
		validate: function() {
			var firstSameAsLast = (trekmap.points[0] == trekmap.points[trekmap.points.length - 1]);
			return (!firstSameAsLast && trekmap.points.length > 0);
		},
		process: function() {
			if (trekmap.actions.sameWayBack.validate()) {
				pts = trekmap.points.slice(0);
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
		imageSrc: 'http://localhost/edu/trekmap/src/document_root/img/dot.gif', // TODO
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
		if ($defined(el)) {
			var total = 0;
			if (trekmap.points.length > 1) {
				for(var i = 1; i < trekmap.points.length; i++) {
					total += trekmap.points[i].distanceFrom(trekmap.points[i - 1]);
				}
			}
			trekmap.meters = total;
			el.setText((total / trekmap.unit.ratio).toFixed(2)); // in kilometers
		}
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
		
		interval = trekmap.distance.getInterval(); // interval detection
		
		var count = 0; // count of milestones on map
		var rest = 0; // rest from previous segment
		
		var i, j; // iterators
		var A, B; // border points of segment
		var d, n, k, distances, target, stone;
		
		for (i = 1; i < trekmap.points.length; i++) { // iterating segments
			A = trekmap.points[i - 1].convertTo(ACoordinateSystem.S42); // border point A
			B = trekmap.points[i].convertTo(ACoordinateSystem.S42); // border point B
			
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
			rest = interval - (d - distances.pop());
		}
	}
}

/**
 * Click handler.
 */
trekmap.click = function(object, point) {
	if (trekmap.mode.status == 'design') {
        trekmap.points.push(point);
        trekmap.update();
	}
};

/**
 * Updates trekmap.
 */
trekmap.update = function() {
	trekmap.distance.update();
	trekmap.line.update();
    trekmap.menu.update();
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
    $('trekmap-total-distance').setText((0).toFixed(2));
    
    // trekmap
    trekmap.map = map;
    trekmap.mode.set('view'); // initialize mode
} });
