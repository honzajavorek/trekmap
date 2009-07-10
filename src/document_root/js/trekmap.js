/**
 * TrekMap engine.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2009 Jan Javorek
 * @package    Javorek
 */

/* Compatibility ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function debug(msg) { new Element('span').setText(msg.toString() + ' ').injectTop(document.body); }
function apiMissing() { return (undefined === window.MooTools || undefined === window.AMap); }

// MooTools required, AMapy required
if (apiMissing()) { throw new Error('MooTools and/or AMapy are undefined.'); }
// php is global variable with some basic config and info from server side
if (!$defined(window.php)) { throw new Error('Global variable php is undefined.'); }
// Geocoding Google API required
if (undefined === window.GMap2) { google.load('maps', '2'); }



/* TrekMap constants ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TREKMAP_GREEN = '#197B30';
var TREKMAP_BROWN = '#7C4A1F';
var TREKMAP_BLACK = '#222';
var TREKMAP_GREY = '#666';

var TREKMAP_DISTANCE_RATIO = 1000; // 1 km = 1000 m
var TREKMAP_DISTANCE_LABEL = 'km'



/* Flash message ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var Flash = new Class({
	type: 'Flash',
	element: null,
	
	initialize: function(html, type) {
		$$('.flashes').empty();
		
		type = type || 'note';
		this.element = new Element('p')
			.addClass('flash')
			.addClass('temporary')
			.addClass(type)
			.setHTML(html)
			.injectTop($$('.flashes')[0]);
		
		if (type == 'note') {
			this.element
				.setStyle('cursor', 'pointer')
				.addEvent('click', this.hide.bind(this));
			this.hide.delay(3000, this);
		}
	},
	
	hide: function() {
		this.element.remove();
	}
});



/* Amapy.cz ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TrekMapTypeControl = AMapTypeControl.extend({
	mapPartInit: function(map, el) {
		this.buttons = this.buttons || {};
        mapTypes = map.getMapTypes();
        this.createButton(mapTypes[0].displayName, 0, map, el);
        this.createButton(mapTypes[2].displayName, 1, map, el);
        this.createButton(mapTypes[5].displayName, 2, map, el);
        this.setActiveMapType(map);
        map.addEvent('onMapTypeChanged', this.setActiveMapType.pass(map, this));
        el.setStyles({ width: '156px', height: '19px' });
    },
	setActiveMapType: function(map) {
		this.parent(map);
		for (var btn in this.buttons) {
			this.buttons[btn]
				.setStyle('background', TREKMAP_GREEN)
		}
		this.buttons[map.getCurrentMapType().displayName]
			.setStyle('background', TREKMAP_BLACK);
	},
	createButton: function(html, i, map, el) {
		this.parent(html, i, map, el);
		this.buttons[html]
			.setStyle('background', TREKMAP_GREEN);
	}
});

var TrekMapLayerControl = AMapLayerControl.extend({
	createButton: function(layer) {
		this.parent(layer);
		this.buttons[this.buttons.length - 1].setStyle('background', TREKMAP_GREEN);
	},
	onClick: function(e, tmp) {
		var t = e.target;
		t.pressed = !t.pressed;
		t.setStyle('background', t.pressed ? TREKMAP_BLACK: TREKMAP_GREEN).layer = tmp;
		if (t.pressed) {
			this.visibles.push(tmp);
		} else {
			this.visibles.remove(tmp);
		}
		if (this.map.getCurrentScale() > 500000 && (this.visibles.contains(A_CYCLE_MAP) || this.visibles.contains(A_TOURISTIC_MAP))) {
			new Flash('Turistické a cyklistické stezky se zobrazí až od měřítka <strong>1:500000</strong>.');
		}
		this.map.registerLayers(this.visibles);
	}
});

var TrekMapCompassControl = ASmallMapControl.extend({
	mapPartInit: function(map, el) {
		this.parent(map, el);
		el.getFirst().nju264(php.baseUri + 'img/compass.png');
	}
});



/* TrekMap ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TrekMap = new Class({
	type: 'TrekMap',
	element: null,
	map: null,
	track: null,
	
	/* gui elements */
	
	gui: {
		distanceDriver: null, // place where to display km
		geocodingDriver: null, // area with text input and button
		altitudeDriver: null, // altitude chart element
		
		milestonesToggle: null, // onclick toggles milestones
		editorToggle: null, // onclick toggles editor, if button, images are applied
		altitudeToggle: null, // onclick toggles altitude chart
		
		saveButton: null,
		resetButton: null,
		undoButton: null,
		finishLoopButton: null,
		sameWayBackButton: null
	},
	
	/* controls */
	
	editor: null,
	geocoding: null,
	
	/* init */
	
	initialize: function(el) {
		this.element = new Element('div') // main map element
			.setStyles('width: 100%; height: 100%; position: relative;')
			.injectTop($(el));
		this.guard = this.prepareGuard(); // preparing a guard for locking
		for (element in this.gui) { // autoloading of gui elements
			this.gui[element] = $('tm-' + element.hyphenate());
		}
		if (this.initMap()) {
			// controls
			this.editor = new TMEditor(this);
			this.geocoding = new TMGeocoding(this);
			this.track = new TMTrack(this);
		
			// loading
			if ($defined(window.php.track)) { // prepared track to display
				this.track.decode(window.php.track);
		    } else if ($defined(window.php.place)) { // auto focus
		    	this.geocoding.set(window.php.place);
		    }
			
			// inner controls
			this.map.addMapPart(new TrekMapTypeControl());
			this.map.addMapPart(new TrekMapLayerControl([A_CYCLE_MAP, A_TOURISTIC_MAP]));
			this.map.addMapPart(new TrekMapCompassControl());
		}
	},
	
	initMap: function() {
		if (window.opera) {
			new Flash('Prohlížeč Opera bohužel není službou AMapy.cz podporován.', 'error');
			return false;
		}
		this.map = new AMap(this.element, {
			showAtlasLogo: false,
			mapCursor: 'crosshair',
			onClick: this.clicked.bind(this), // f(object, point)
			onScaleChanged: this.zoomed.bind(this) // f(map)
		});
		this.map.loadMaps(); // f(null, null, A_TOURISTIC_CART_MAP.displayName)
		return true;
	},
	
	redraw: function() {
		this.map.update();
		this.track.redraw();
	},
	
	/* locking */
	
	locked: false,
	guard: null,
	
	prepareGuard: function() {
		// transparent film to prevent clicking on map
		var guard = new Element('div', {id: 'tm-lock'})
			.setStyles({
			 	position: 'absolute', top: 0, left: 0, 'z-index': 999,
			 	width: this.element.getStyle('width'), height: this.element.getStyle('height'),
			 	cursor: 'not-allowed',
			 	display: 'none'
			})
			.injectInside(this.element);
		new Fx.Style(guard, 'opacity').set(0.50);
		return guard;
	},
	
	lock: function() {
		if (this.locked) return;
		this.locked = true;
		this.guard.setStyle('display', 'block');
	},
	
	unlock: function() {
		if (!this.locked) return;
		this.guard.setStyle('display', 'none');
		this.locked = false;
	},
	
	/* listeners */
	
	clicked: function(object, point) {
		if (this.editor.active) {
			this.track.add(point);
			this.track.redraw();
			this.editor.redraw();
		}
	},
	
	zoomed: function(map) {
		
	}
	
});



/* Editation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TMEditor = new Class({
	type: 'TMEditor',
	trekmap: null,
	active: false,
	toggleButton: null,
	img: [],
	
	controls: [
		'save',
		'reset',
		'undo',
		'finishLoop',
		'sameWayBack'
	],
	
	initialize: function(map) {
		this.trekmap = map;
		
		// toggle button
		this.toggleButton = this.trekmap.gui.editorToggle
			.empty()
			.addEvent('click', this.toggle.bind(this));
		
		// init images
		var size = 32;
		this.img[0] = new Element('img', {
			src: window.php.baseUri + 'img/design.png',
			width: size, height: size,
			alt: 'Upravovat', title: 'Upravovat trasu'
		})
			.setStyles('margin: 0; padding: 0; border: none; display: block;')
			.injectInside(this.toggleButton);
			
		this.img[1] = new Element('img', {
			src: window.php.baseUri + 'img/view.png',
			width: size, height: size,
			alt: 'Prohlížet', title: 'Prohlížet trasu'
		})
			.setStyles('margin: 0; padding: 0; border: none; display: none;')
			.injectInside(this.toggleButton);
			
		this.toggleButton.setProperty('title', this.img[0].getProperty('title'));
		
		// other controls
		for (var i = 0, btn; i < this.controls.length; i++) {
			btn = this.controls[i];
			if ($defined(this[btn])) {
				this.trekmap.gui[btn + 'Button']
					.addEvent('click', this[btn].bind(this));
			}
		}
		this.redraw();
	},
	
	toggle: function() {
		this.img[new Number(!this.active)].setStyle('display', 'block');
		this.img[new Number(this.active)].setStyle('display', 'none');
		this.toggleButton.setProperty('title', this.img[new Number(!this.active)].getProperty('title'));
		this.active = !this.active;
		this.redraw();
	},
	
	redraw: function() {
		for (var i = 0, btn, disabled; i < this.controls.length; i++) {
			btn = this.controls[i];
			if ($defined(this[btn])) {
				disabled = !this.active || !this[btn + 'Validator']();
				this.trekmap.gui[btn + 'Button'].disabled = disabled;
			}
			this.applyActivity(this.trekmap.gui[btn + 'Button']);
		}
	},
	
	applyActivity: function(el) {
		// new Fx.Style(el, 'opacity').set((this.active)? 1 : 0.5);
		el.setStyle('display', (this.active)? 'block' : 'none')
	},
	
	/* controls */
	
	resetValidator: function() {
		return this.trekmap.track.isLine();
	},
	reset: function() {
		if (this.resetValidator()) {
			this.trekmap.track.empty();
			this.trekmap.track.redraw();
			this.redraw();
		}
	},
	
	undoValidator: function() {
		return !this.trekmap.track.isEmpty();
	},
	undo: function() {
		if (this.undoValidator()) {
			this.trekmap.track.pop();
			this.trekmap.track.redraw();
			this.redraw();
		}
	},
	
	finishLoopValidator: function() {
		return !this.trekmap.track.isLoop();
	},
	finishLoop: function() {
		if (this.finishLoopValidator()) {
			this.trekmap.track.close();
		    this.trekmap.track.redraw();
			this.redraw();
		}
	},
	
	sameWayBackValidator: function() {
		return !this.trekmap.track.isLoop();
	},
	sameWayBack: function() {
		if (this.resetValidator()) {
			var pts = this.trekmap.track.clone();
			pts.pop();
			pts.reverse();
			this.trekmap.track.append(pts);
			this.trekmap.track.redraw();
			this.redraw();
		}
	},
});



/* Geocoding ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TMGeocoding = new Class({
	type: 'TMGeocoding',
	trekmap: null,
	
	textfield: null,
	button: null,
	
	bounds: { // Czech Republic
		sw: [48.5525, 12.091389],
		ne: [51.055556, 18.858889]
	},
	
	initialize: function(map) {
		this.trekmap = map;
		
		var wrapper = this.trekmap.gui.geocodingDriver.getProperty('id');
		this.textfield = $$("#" + wrapper + " input[type='text']")[0];
		
		// searching for a first 'button' element inside of the wrapper
		var types = ["input[type='submit']", "input[type='button']", "input[type='image']", "button"];
		for (var i = 0, el; this.button == null && i < types.length; i++) {
			el = $$('#' + wrapper + ' ' + types[i]);
			if (el) { this.button = el[0]; }
		}
		
		// events
		var enter = function(event) { event = new Event(event); if (event.key == 'enter') { this.search(); } }
		this.textfield.addEvent('keydown', enter.bind(this));
		this.button.addEvent('click', this.search.bind(this));
	},
	
	set: function(place) {
		this.locate(place, this.focus.bind(this));
	},
	
	search: function() {
		var place = this.textfield.getProperty('value');
		this.locate(place, this.focus.bind(this));
	},
	
	focus: function(point) {
		this.trekmap.map.zoomTo(64000, point, false);
		this.trekmap.redraw();
		this.trekmap.map.setMapType(A_TOURISTIC_CART_MAP.displayName);
	},
	
	locate: function(place, callback) {
		if (!place) return false;
		
		// google geocoder
		var geocoder = new GClientGeocoder();
		geocoder.setBaseCountryCode('cz');

		var handler = function(point) {
			// bounds
			var sw = new GLatLng(this.bounds.sw[0], this.bounds.sw[1]);
			var ne = new GLatLng(this.bounds.ne[0], this.bounds.ne[1]);
			var bounds = new GBounds([sw, ne]);
			
			// point processing
			if (!point || !bounds.containsPoint(point)) {
				new Flash('Místo &quot;' + place + '&quot; nebylo nalezeno.');
			} else {
				callback(new AGeoPoint(point.y, point.x, ACoordinateSystem.Geodetic));
			}
		}
		geocoder.getLatLng(place, handler.bind(this));
	}
});



/* Track ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TMTrack = new Class({
	type: 'TMTrack',
	trekmap: null,
	points: [],
	milestones: null,
	altitude: null,
	lines: {
		forth: null,
		back: null
	},
	meters: 0,
	
	initialize: function(map) {
		this.trekmap = map;
		this.milestones = new TMMilestones(map);
		this.altitude = new TMAltitude(map);
		this.displayDistance(0);
	},
	
	isLine: function() {
		return (this.points.length > 1);
	},
	
	isEmpty: function() {
		return (this.points.length <= 0);
	},
	
	isLoop: function() { // whether first point is the same as the last one
		if (!this.isEmpty()) {
			return (this.points[0].coords == this.points[this.points.length - 1].coords);
		}
		return true;
	},
	
	add: function(point, altitude) {
		this.points.push({
			coords: point,
			alt: altitude
		});
		if (!altitude) {
			this.altitude.determine(this.points.length - 1);
		}
	},
	
	append: function(points) {
		this.points = this.points.concat(points);
	},
	
	pop: function() {
		if (this.points.length == 2) {
	        this.points.pop();
		}
		return this.points.pop();
	},

	empty: function() {
		this.points = [];
	},
	
	close: function() { // closes track into a loop
		var p = { coords: this.points[0].coords };
		if ($defined(this.points[0].alt)) {
			p.alt = this.points[0].alt;
		}
	    this.points.push(p);
	},
	
	clone: function() { // clones 
		var pts = [], p;
		for (var i = 0; i < this.points.length; i++) {
			p = { coords: this.points[i].coords };
			if ($defined(this.points[i].alt)) {
				p.alt = this.points[i].alt;
			}
			pts.push(p);
		}
		return pts;
	},
	
	redraw: function() {
		// clear lines
		if (this.lines.forth != null) { this.lines.forth.remove(); }
		if (this.lines.back != null) { this.lines.back.remove(); }
		// measure
		this.meters = this.measure();
		// milestones
		this.milestones.redraw();
		// draw
		this.draw();
	},
	
	draw: function() {
		if (!this.isLine()) return;

		var A, B, breakpoint; // border points, breakpoint
		var k, d; // ratio, distance
		var total = 0; // distance collector
		var half = this.meters / 2; // half of the way
		
		var forth = [];
		var back = [];
		
		for (var i = 0; i < this.points.length; i++) {
			if (i + 1 != this.points.length) { // if it isn't last point
				A = this.points[i].coords.convertTo(ACoordinateSystem.S42);
				B = this.points[i + 1].coords.convertTo(ACoordinateSystem.S42);
				
				d = B.distanceFrom(A);
				total += d;
			}
			
			if (total < half) { // less then half
				forth.push(this.points[i].coords);
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
					
					forth.push(this.points[i].coords);
					forth.push(breakpoint);
					back.push(breakpoint);
				} else {
					back.push(this.points[i].coords);
				}
			}
		}
		
		// way forth
		this.lines.forth = new APolyline(forth, {
			color: TREKMAP_BLACK,
			weight: '4px',
			opacity: 1
		});
		this.trekmap.map.addOverlay(this.lines.forth);
		
		// way back
		this.lines.back = new APolyline(back, {
			color: TREKMAP_GREY,
			weight: '4px',
			opacity: 1
		});
		this.trekmap.map.addOverlay(this.lines.back);
	},
	
	measure: function() { // in meters
		var meters = 0;
		if (this.isLine()) {
			for(var i = 0; i < this.points.length; i++) { // checking if all points have meters
				if (!$defined(this.points[i].meters)) { // if not set from before
					this.points[i].meters = (i != 0)?
						 this.points[i - 1].meters + this.points[i].coords.distanceFrom(this.points[i - 1].coords)
						 : this.points[i].meters = 0;
				}
			}
			meters = this.points[this.points.length - 1].meters; // the last one
		}
		this.displayDistance(meters);
		return meters;
	},
	
	displayDistance: function(meters) {
		this.trekmap.gui.distanceDriver.setText((meters / TREKMAP_DISTANCE_RATIO).toFixed(2));
	},
	
	/* encode to JSON */
	encode: function() {
		var pts = [];
		var tmp;
		for (var i = 0; i < this.points.length; i++) {
			tmp = this.points[i].convertTo(ACoordinateSystem.Geodetic);
			pts.push({
				coords: {
					x: tmp.coords.x + 0,
					y: tmp.coords.y + 0
				},
				alt: tmp.alt + 0
			});
		}
		return Json.toString(pts);
	},
	
	/* decode from JSON */
	decode: function(data) {
		this.points = [];
		var pts = Json.evaluate(data);
		for (var i = 0; i < pts.length; i++) {
			this.points.push({
				coords: new AGeoPoint(pts[i].coords.x + 0, pts[i].coords.y + 0, ACoordinateSystem.Geodetic).convertTo(ACoordinateSystem.S42),
				alt: pts[i].alt + 0
			});
		}
	}
});



/* Distance markers ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TMMilestones = new Class({
	type: 'TMMilestones',
	trekmap: null,
	stones: [],
	
	label: new AIcon({
		imageSrc: null,
		shadowSrc: null,
		fastRollover: false,
		imageSize: null,
		iconOffset: new APoint(0, 0),
		labelStyle: 'display: inline; white-space: nowrap; padding: 2px 5px; float: left; text-align: left; background-color: #393939; color: #FFF; font: bold 9px sans-serif;',
		labelOffset: new APoint(0, 0),
		className: 'milestone',
		opacity: 0.65
	}),
	dot: new AIcon({
		imageSrc: php.baseUri + 'img/dot.gif', // TODO
		shadowSrc: null,
		fastRollover: false,
		imageSize: new ASize(22, 27),
		iconOffset: new APoint(0, 0),
	}),
	
	initialize: function(map) {
		this.trekmap = map;
		this.trekmap.gui.milestonesToggle.addEvent('click', this.redraw.bind(this));
	},
	
	detectInterval: function() {
		var scale = Math.ceil(this.trekmap.map.getCurrentScale() / 100000);
		if (scale < 2) interval = 1;
		else if (scale < 6) interval = 5;
		else if (scale < 11) interval = 10;
		else if (scale < 26) interval = 25;
		else interval = 50;
		return interval * TREKMAP_DISTANCE_RATIO; // in meters
	},
	
	isActive: function() {
		return this.trekmap.track.isLine() && this.trekmap.gui.milestonesToggle.checked;
	},
	
	empty: function() {
		for (var i = 0; i < this.stones.length; i++) {
			this.stones[i][0].remove();
			this.stones[i][1].remove();
		}
	},
	
	redraw: function() {
		this.empty();
		this.draw();
	},
	
	draw: function() {
		if (!this.isActive()) return;
		var interval = this.detectInterval();
		var points = this.trekmap.track.points;
		
		var count = 0; // count of milestones on map
		var rest = 0; // rest from previous segment
		
		var i, j; // iterators
		var A, B; // border points of segment
		var d, n, k, distances, target, stone;
		
		for (i = 1; i < points.length; i++) { // iterating segments
			A = points[i - 1].coords.convertTo(ACoordinateSystem.S42); // border point A
			B = points[i].coords.convertTo(ACoordinateSystem.S42); // border point B

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
						icon: this.label,
						label: Math.round(count * (interval / TREKMAP_DISTANCE_RATIO)) + ' ' + TREKMAP_DISTANCE_LABEL
					}),
					new AMarker(target, {
						icon: this.dot,
					})
				];
				
				// puting into map
				this.trekmap.map.addOverlay(stone[0]);
				this.trekmap.map.addOverlay(stone[1]);
				
				// saving in stack
				this.stones.push(stone);
			}
			
			// rest
			rest = interval - (d - ((distances.length > 0)? distances.pop() : 0));
		}
	}
});



/* Altitude ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TMAltitude = new Class({
	type: 'TMAltitude',
	trekmap: null,
	
	api: {
		permanent: null,
		temporary: null
	},
	
	index: null, // index of point
	
	busy: false,
	
	initialize: function(map) {
		this.trekmap = map;
	},
	
	determine: function(i) {
		if (this.busy) return false;
		this.index = i;
		
		var coords = this.trekmap.track.points[i].coords.convertTo(ACoordinateSystem.Geodetic);
		this.trekmap.lock();
//		try { // primary
			this.askVyskopisCz(coords);
//		} catch (error) { // alternative
//			this.askGeoNames(coords);
//		}
	},
	
	askVyskopisCz: function(coords) {
		this.busy = true;
		if (!$defined(window.php.vyskopis) || !php.vyskopis) throw new Error('API key for Vyskopis.cz is not defined.'); // vyskopis api key
		
//		var loader = new TMLoader('http://vyskopis.cz/api/getapi_v1.php?key=' + escape(php.vyskopis));
		var uri = 'http://ws.geonames.org/gtopo30?lat=' + escape(coords.x) + '&lng=' + escape(coords.y);
		new TMRemoteAjax(uri, this.receive.bind(this));
		
//		if (!$defined(window.topoGetAltitude)) {
//			this.api.permanent = this.trekmap.appendScript(); // append script
//		}
//		var code = 'window.topoGetAltitude(' + coords.x + ', ' + coords.y + ', receive, null, 3000);'; // waits 3 seconds
//		this.api.temporary = new Element('script', {type: 'text/javascript'}).setHTML(code).injectBefore(this.api.permanent);
	},
	
	askGeoNames: function(coords) {
		this.busy = true;
//		var uri = 'http://ws.geonames.org/gtopo30JSON?lat=' + escape(coords.x) + '&lng=' + escape(coords.y) + '&callback=receive';
//		this.api.temporary = this.trekmap.appendScript(uri);
	},
	
	receive: function(result) {
		alert(result);
	},
	
	
}); 



/* API loader ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TREKMAP_CALLBACK_CONTAINER = [];

var TMRemoteAjax = new Class({
//	script: null,
	callback: null,
	
	initialize: function(uri, callback) {
		this.callback = callback;
		var proxy = php.proxyUri + '?uri=' + escape(uri);
		new Ajax(proxy, {
			method: 'get',
			onComplete: this.receive.bind(this)
		}).request();
		
//		var callback = this.prepareCallback();
//		uri.replace('%c', callback); // callback replacement
//		this.script = new Element('script', {src: new String(uri), type: 'text/javascript'})
//			.injectTop(document.body);
	},
	
	prepareCallback: function() {
//		TREKMAP_CALLBACK_CONTAINER.push(this.receive.bind(this));
//		return 'TREKMAP_CALLBACK_CONTAINER[' + TREKMAP_CALLBACK_CONTAINER.length - 1 + ']';
	},
	
	receive: function(result) {
		this.callback(eval(result));
	}
});

//appendScript: function(uri) {
//		return new Element('script', {src: new String(uri)}).injectTop(document.body);
//	},


/* Run ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

window.addEvent('domready', function () {
	new TrekMap('trekmap');
});

