/**
 * TrekMap engine.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2009 Jan Javorek
 * @package    Javorek
 */

/* Compatibility ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function debug(msg) { new Element('span').setText('' + msg + ' ').injectInside(document.body); }
function apiMissing() { return (undefined === window.MooTools || undefined === window.AMap); }

// MooTools required, AMapy required
if (apiMissing()) { throw new Error('MooTools and/or AMapy are undefined.'); }
// php is global variable with some basic config and info from server side
if (!$defined(window.php)) { throw new Error('Global variable php is undefined.'); }
// Geocoding Google API required
if (undefined === window.GMap2) { google.load('maps', '2'); }



/* TrekMap constants ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TREKMAP_GREEN = '#197B30';
var TREKMAP_RED = '#ED1C24';
var TREKMAP_BLACK = '#222';

var TREKMAP_DISTANCE_RATIO = 1000; // 1 km = 1000 m
var TREKMAP_DISTANCE_LABEL = 'km'



/* Flash message ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var Flash = new Class({
	type: 'Flash',
	element: null,
	
	initialize: function(html, type) {
		$$('.flashes').empty();
		
		type = type || 'info';
		this.element = new Element('p')
			.addClass('flash')
			.addClass(type)
			.setHTML(html)
			.injectTop($$('.flashes')[0]);
		
		if (type == 'info') {
			this.element
				.setStyle('cursor', 'pointer')
				.addEvent('click', this.hide.bind(this));
			this.hide.delay(5000, this);
		}
	},
	hide: function() {
		this.element.remove();
	}
});



/* Amapy.cz ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

AMapAssets.css = []; // removing styles, CSS expected in external file

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
		descriptionDriver: null, // track description area (searching for textarea inside)
		articulationDriver: null, // difference between min and max altitude
		altitudeDifferenceDriver: null, // number of meters going upstairs
		
		milestonesToggle: null, // onclick toggles milestones
		editorToggle: null, // onclick toggles editor, if button, images are applied
		altitudeToggle: null, // onclick toggles altitude chart
		centerToggle: null, // onclick toggles automatic centering of map
		
		saveButton: null,
		previewButton: null,
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
		$(el).setStyle('height', window.getHeight() - $(el).getTop() - 15); // auto height

		this.guard = this.prepareGuard(); // preparing a guard for locking
		for (element in this.gui) { // autoloading of gui elements
			this.gui[element] = $('tm-' + element.hyphenate());
		}
		if (this.initMap()) {
			// controls
			this.track = new TMTrack(this);
			this.geocoding = new TMGeocoding(this);
			this.editor = new TMEditor(this);
		
			// loading
			if ($defined(window.php.track)) { // prepared track to display
				this.track.decode(window.php.track);
				this.track.focus();
				this.editor.redraw();
		    } else if ($defined(window.php.place)) { // auto focus
		    	this.geocoding.set(window.php.place);
		    }
			
			// inner controls
			this.map.addMapPart(new TrekMapTypeControl());
			this.map.addMapPart(new TrekMapLayerControl([A_CYCLE_MAP, A_TOURISTIC_MAP]));
			this.map.addMapPart(new TrekMapCompassControl());
			
			// layers
			this.layers.push(new TMPanoramio(this.map));
			this.layers.push(new TMWikipedia(this.map));
			this.layers.push(new TMTopoNames(this.map));
			this.layers.push(new TMWebCams(this.map));
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
			onScaleChanged: this.zoomed.bind(this), // f(map)
			onUpdateEnd: this.refreshLayers.bind(this) // for layers
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
			 	background: 'transparent',
			 	width: this.element.getStyle('width'), height: this.element.getStyle('height'),
			 	cursor: 'wait', //cursor: 'not-allowed',
			 	display: 'none'
			})
			.injectInside(this.element);
		new Fx.Style(guard, 'opacity').set(0.65);
		return guard;
	},
	displayGuard: function() {
		this.guard.setStyle('display', 'block');
		//(function() {
			this.guard.setStyle('background', '#FFF');
		//}).delay(1000, this);
	},
	hideGuard: function() {
		this.guard.setStyle('display', 'none').setStyle('background', 'transparent');
	},
	lock: function() {
		if (this.locked) return;
		this.locked = true;
		this.displayGuard();
	},
	unlock: function() {
		if (!this.locked) return;
		this.hideGuard();
		this.locked = false;
	},
	
	/* helpers */
	
	findPoint: function(A, B, distance) {
		// similarity of triangles
		var k = distance / B.distanceFrom(A); // ratio
		return new AGeoPoint(
			(k * (B.x - A.x)) + A.x,
			(k * (B.y - A.y)) + A.y,
			ACoordinateSystem.Geodetic
		);
	},
	
	/* listeners */
	
	clicked: function(object, point) {
		if (this.locked) return false;
		
		if (this.editor.active) {
			this.lock();
			this.track.add(point.convertTo(ACoordinateSystem.Geodetic));
			this.track.redraw();
			this.editor.redraw();
		}
	},
	zoomed: function(map) {
		if ($defined(this.track)) {
			this.track.redraw();
		}
	},
	
	/* layers */
	
	layers: [],

	refreshLayers: function() {
		for (var i = 0; i < this.layers.length; i++) {
			this.layers[i].redraw();
		}
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
		'preview',
		'reset',
		'undo',
		'finishLoop',
		'sameWayBack',
		'save'
	],
	
	initialize: function(map) {
		this.trekmap = map;
		
		if ($defined(this.trekmap.gui.editorToggle)) {
			// toggle button
			this.toggleButton = this.trekmap.gui.editorToggle
				.empty()
				.addEvent('click', this.toggle.bind(this));
			
			// init images
			var size = 32;
			this.img[0] = new Element('img', {
				src: window.php.baseUri + 'img/icon-design.png',
				width: size, height: size,
				alt: 'Upravovat', title: 'Upravovat trasu'
			})
				.setStyles('margin: 0; padding: 0; border: none; display: block;')
				.injectInside(this.toggleButton);
				
			this.img[1] = new Element('img', {
				src: window.php.baseUri + 'img/icon-view.png',
				width: size, height: size,
				alt: 'Prohlížet', title: 'Prohlížet trasu'
			})
				.setStyles('margin: 0; padding: 0; border: none; display: none;')
				.injectInside(this.toggleButton);
				
			this.toggleButton.setProperty('title', this.img[0].getProperty('title'));
		}
		
		// other controls
		for (var i = 0, btn; i < this.controls.length; i++) {
			btn = this.controls[i];
			if ($defined(this.trekmap.gui[btn + 'Button']) && $defined(this[btn])) {
				this.trekmap.gui[btn + 'Button']
					.addEvent('click', this[btn].bind(this));
			}
		}
		this.redraw();
	},
	toggle: function() {
		this.img[new Number(!this.active)].setStyle('display', 'inline');
		this.img[new Number(this.active)].setStyle('display', 'none');
		this.toggleButton.setProperty('title', this.img[new Number(!this.active)].getProperty('title'));
		this.active = !this.active;
		this.redraw();
	},
	redraw: function() {
		for (var i = 0, btn, detached, disabled; i < this.controls.length; i++) {
			btn = this.controls[i];
			if ($defined(this.trekmap.gui[btn + 'Button'])) {
				detached = this.trekmap.gui[btn + 'Button'].hasClass('detached');
				if ($defined(this[btn]) && $defined(this[btn + 'Validator'])) {
					disabled = (!this.active && !detached) || !this[btn + 'Validator']();
					this.trekmap.gui[btn + 'Button'].disabled = disabled;
					new Fx.Style($$('#' + this.trekmap.gui[btn + 'Button'].getProperty('id') + ' img')[0], 'opacity').set((disabled)? 0.2 : 1);
				}
				if (!detached) {
					this.applyActivity(this.trekmap.gui[btn + 'Button']);
				}
			}
		}
	},
	applyActivity: function(el) {
		el.setStyle('display', (this.active)? 'inline' : 'none')
	},
	
	/* controls */
	
	previewValidator: function() {
		return this.trekmap.track.isLine();
	},
	preview: function() {
		if (this.previewValidator()) {
			this.trekmap.track.focus();
		}
	},
	
	resetValidator: function() {
		return this.trekmap.track.isLine();
	},
	reset: function() {
		if (this.resetValidator() && window.confirm('Opravdu smazat všechny body?')) {
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
		if (this.sameWayBackValidator()) {
			var pts = this.trekmap.track.clone();
			pts.pop();
			pts.reverse();
			this.trekmap.track.append(pts);
			this.trekmap.track.redraw();
			this.redraw();
		}
	},
	
	saveValidator: function () {
		return this.trekmap.track.isLine();
	},
	saveRedirect: function(payload) {
		try {
			payload = Json.evaluate(payload);
			if (!payload) throw new Error('No response.');
			if (!$defined(payload.uri)) throw new Error('No URI in response.');
			window.location.replace(new String(payload.uri));
		} catch (error) {
			this.trekmap.unlock();
			new Flash('Uložení selhalo. <small>' + error.toString() + '</small>', 'error');
		}
	},
	save: function() {
		if (this.saveValidator()) {
			// description check
			var desc = this.trekmap.gui.descriptionDriver;
			if ($defined(desc)) {
				var textarea = $$('#' + desc.getProperty('id') + ' textarea')[0];
				if (!textarea.value && !window.confirm('Chybí ' + $$('#' + desc.getProperty('id') + ' label')[0].getText().toLowerCase() + '. Opravdu uložit?')) {
					return;
				} else {
					this.trekmap.track.description = textarea.value;
				}
			} else {
				this.trekmap.track.description = '';
			}
			
			// go
			this.trekmap.lock();

			// name check
			if (window.php.mode != 'demo') {
				if ($defined(window.php.name)) { // set by php
					this.trekmap.track.name = window.php.name;
				}
				// else prompt
				while (!this.trekmap.track.name) {
					this.trekmap.track.name = window.prompt('Zadej název nové trasy:', '')
				}
				
				// little validation
				if (this.trekmap.track.name.length < 3 || this.trekmap.track.name.length > 100) {
					window.alert('Název musí mít od 3 do 100 znaků.');
					return;
				}
				if (this.trekmap.track.description != '' && (this.trekmap.track.description.length < 3 || this.trekmap.track.description.length > 400)) {
					window.alert('Popis musí mít od 3 do 400 znaků.');
					return;
				}
			}
			
			// send request
			new Ajax(window.php.saveUri, {
				method: 'get',
				data: { track: this.trekmap.track.encode() },
				onComplete: this.saveRedirect.bind(this)
			}).request();
		}
	}
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
		if ($defined(this.trekmap.gui.geocodingDriver)) {
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
		}
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
	name: '',
	description: '',
	
	start: {
		icon: A_GREEN_FLAG,
//		new AIcon({
//			imageSrc: php.baseUri + 'img/marker-start.png',
//			shadowSrc: null,
//			fastRollover: false,
//			imageSize: new ASize(16, 16),
//			iconOffset: new APoint(8, 8),
//		}),
		marker: null
	},
	finish: {
		icon: A_RED_FLAG,
//		new AIcon({
//			imageSrc: php.baseUri + 'img/marker-finish.png',
//			shadowSrc: null,
//			fastRollover: false,
//			imageSize: new ASize(16, 16),
//			iconOffset: new APoint(8, 8),
//		}),
		marker: null
	},
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
		var length = this.points.push({
			coords: point,
			alt: altitude
		});
		if (!altitude) {
			this.altitude.determine(this.points[length - 1]);
		} else {
			this.trekmap.unlock();
		}
		if ($defined(this.trekmap.gui.centerToggle) && this.trekmap.gui.centerToggle.getProperty('checked')) {
			this.focus(this.points[length - 1].coords);
		}
	},
	append: function(points) {
		this.points = this.points.concat(points);
	},
	pop: function() {
		var last = this.points[this.points.pop() - 1];
		if ($defined(last) && $defined(last.segment)) {
			delete last.segment;
		}
		
		if (this.points.length == 1) {
	        this.pop();
	        this.start.marker.remove();
	        this.finish.marker.remove();
		}
	},
	empty: function() {
		this.points = [];
		this.start.marker.remove();
	    this.finish.marker.remove();
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
		this.meters = this.measure(this.points);
		this.displayDistance(this.meters);
		
		this.milestones.redraw();
		this.draw();
		this.altitude.update();
		this.altitude.chart.redraw();
		
		// debug
//		var markers = [];
//		for (var i = 0; i < this.points.length; i++) {
//			markers.push(new AMarker(this.points[i].coords, {
//	            label       : this.points[i].alt,
//	            maxZoom     : 1
//	        }));
//		}
//		this.trekmap.map.addMarkers(markers);
	},
	draw: function() {
		if (!this.isLine()) {
			if (!this.isEmpty()) {
				this.start.marker = new AMarker(this.points[0].coords, { icon: this.start.icon });
				this.trekmap.map.addOverlay(this.start.marker);
			}
			return;
		}

		var A, B, breakpoint; // border points, breakpoint
		var d; // distance
		var total = 0; // distance collector
		var half = this.meters / 2; // half of the way
		
		var forth = [];
		var back = [];
		
		for (var i = 0; i < this.points.length; i++) {
			if (i + 1 != this.points.length) { // if it isn't last point
				A = this.points[i].coords;
				B = this.points[i + 1].coords;
				
				d = B.distanceFrom(A);
				total += d;
			}
			
			if (total < half) { // less then half
				forth.push(this.points[i].coords);
			} else {
				if (back.length < 1) {
					breakpoint = this.trekmap.findPoint(A, B, d - (total - half)); // breakpoint
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
			color: TREKMAP_GREEN,
			weight: '4px',
			opacity: 1
		});
		this.trekmap.map.addOverlay(this.lines.forth);
		
		// way back
		this.lines.back = new APolyline(back, {
			color: TREKMAP_RED,
			weight: '4px',
			opacity: 1
		});
		this.trekmap.map.addOverlay(this.lines.back);
		
		// start/finish
		if ($defined(this.start.marker)) this.start.marker.remove();
		if ($defined(this.finish.marker)) this.finish.marker.remove();
		
		this.start.marker = new AMarker(this.points[0].coords, { icon: this.start.icon });
		this.finish.marker = new AMarker(this.points[this.points.length - 1].coords, { icon: this.finish.icon });
		
		this.trekmap.map.addOverlay(this.finish.marker); // finish first
		this.trekmap.map.addOverlay(this.start.marker); // start second, to be always visible
	},
	focus: function(coords) {
		if (!coords) { // focus all the track
			var bounds = [];
			for (var i = 0; i < this.points.length; i++) {
				bounds.push(this.points[i].coords);
			}
			this.trekmap.map.setBestZoomAndCenter(bounds);
			if (this.trekmap.map.getCurrentScale() <= 500000) {
				this.trekmap.map.setMapType(A_TOURISTIC_CART_MAP.displayName);
			}
			this.trekmap.map.update();
		} else {
			this.trekmap.map.moveTo(coords, 500);
			this.trekmap.map.update();
		}
	},
	measure: function(points) { // in meters
		var meters = 0;
		if (this.isLine()) {
			for(var i = 0; i < points.length; i++) { // checking if all points have meters
				if (!$defined(points[i].meters)) { // if not set from before
					points[i].meters = (i != 0)?
						 points[i - 1].meters + points[i].coords.distanceFrom(points[i - 1].coords)
						 : 0;
				}
			}
			meters = points[points.length - 1].meters; // the last one
		}
		return meters;
	},
	displayDistance: function(meters) {
		this.trekmap.gui.distanceDriver.setText((meters / TREKMAP_DISTANCE_RATIO).toFixed(2));
	},
	dilute: function(points, max) {
		var ratio = Math.ceil(points.length / max);
		if (ratio < 2) return points;
		var pts = [];
		for (var i = 0, result; i < points.length; i = i + ratio) {
			// max altitude
			result = 0;
			for (var j = 0; j < ratio; j++) {
				if ($defined(points[i + j])) {
					result = Math.max(result, points[i + j].alt);
				}
			}

			// replacing point
			points[i].alt = result;
			pts.push(points[i]);
		}
		return pts;
	},
	
	/* encode/decode JSON */
	
	encode: function() {
		var pts = [];
		var tmp;
		for (var i = 0; i < this.points.length; i++) {
			tmp = this.points[i];
			tmp.coords = tmp.coords;
			pts.push({
				coords: {
					x: tmp.coords.x + 0,
					y: tmp.coords.y + 0
				},
				alt: tmp.alt + 0
			});
		}
		var result = Json.toString({
			name: '' + this.name,
			description: '' + this.description,
			points: pts,
			length: 0 + this.meters,
			altitude: this.altitude.altDiff,
			articulation: this.altitude.articulation
		});
		if (result.length > 1500) { // URL too long
			this.points = this.dilute(this.points, this.points.length - 1); // cut some points
			return this.encode();
		}
		return result;
	},
	decode: function(data) {
		this.points = [];
		var track = Json.evaluate(data);
		for (var i = 0, p; i < track.points.length; i++) {
			p = { coords: new AGeoPoint(0 + new Number(track.points[i].coords.x), 0 + new Number(track.points[i].coords.y), ACoordinateSystem.Geodetic) };
			if ($defined(track.points[i].alt) && track.points[i].alt) {
				p.alt = 0 + new Number(track.points[i].alt);
			} else {
				this.altitude.determine(p);
			}
			this.points.push(p);
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
		imageSrc: php.baseUri + 'img/dot.gif',
		shadowSrc: null,
		fastRollover: false,
		imageSize: new ASize(4, 4),
		iconOffset: new APoint(2, 2)
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
		var d, n, distances, target, stone;
		
		for (i = 1; i < points.length; i++) { // iterating segments
			A = points[i - 1].coords; // border point A
			B = points[i].coords; // border point B

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
				target = this.trekmap.findPoint(A, B, distances[j]); // point of marker
				count++; // counting
				
				// stone
				stone = [
					new AMarker(target, {
						icon: this.label,
						label: Math.round(count * (interval / TREKMAP_DISTANCE_RATIO)) + ' ' + TREKMAP_DISTANCE_LABEL
					}),
					new AMarker(target, {
						icon: this.dot
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
	chart: null,
	articulation: 0,
	articulationDriver: null,
	altDiff: 0,
	altDiffDriver: null,
	
	initialize: function(map) {
		this.trekmap = map;
		this.chart = new TMAltitudeChart(map);
		
		if (this.trekmap.gui.articulationDriver) {
			this.articulationDriver = this.trekmap.gui.articulationDriver;
		}
		if (this.trekmap.gui.altitudeDifferenceDriver) {
			this.altDiffDriver = this.trekmap.gui.altitudeDifferenceDriver;
		}
	},
	update: function() {
		this.replenish(function() { // when replenished
			this.articulation = this.calculateArticulation();
			if (this.articulationDriver) {
				this.articulationDriver.setText(this.articulation);
			}
			
			this.altDiff = this.calculateAltDiff();
			if (this.altDiffDriver) {
				this.altDiffDriver.setText(this.altDiff);
			}
		}, this);
	},
	calculateAltDiff: function() { // in Czech: "prevyseni"
		if (!this.trekmap.track.isLine()) return 0;
		var altDiff = 0;
		var points = this.getAllPoints();
		for (var i = 0, diff; i < points.length - 1; i++) {
			diff = points[i + 1].alt - points[i].alt;
			if (diff > 0) { // upwards
				altDiff += diff;
			}
		}
		return altDiff;
	},
	calculateArticulation: function() { // in Czech: "clenitost"
		if (!this.trekmap.track.isLine()) return 0;
		var min = 10000, max = 0;
		var points = this.getAllPoints();
		for (var i = 0; i < points.length; i++) {
			min = Math.min(min, points[i].alt);
			max = Math.max(max, points[i].alt);
		}
		var art = max - min;
		return (art < 0)? 0 : art;
	},
	getAllPoints: function() {
		// preparing points
		var points = [];
		var turnovers = this.trekmap.track.points;
		for (var i = 0, j; i < turnovers.length - 1; i++) {
			// adding points from segment to chart
			points.push(turnovers[i]);
			points = points.concat(turnovers[i].segment);
		}
		if (turnovers[i]) points.push(turnovers[i]);
		this.trekmap.track.measure(points);
		return points;
	},
	replenish: function(callback, bindTo) {
		var okay = true;
		
		var turnovers = this.trekmap.track.points;
		var A, B, d, interval;
		for (var i = 0, j; i < turnovers.length - 1; i++) {
			if (!$defined(turnovers[i].segment)) { // replenish segment
				okay = false;
				
				turnovers[i].segment = [];
				A = turnovers[i].coords;
				B = turnovers[i + 1].coords;
				d = B.distanceFrom(A);
				
				interval = Math.round(d / 200);
				interval = Math.max(interval, 50); // minimum interval 50 meters
				
				j = interval;
				while (j <= d) {
					turnovers[i].segment.push({
						coords: this.trekmap.findPoint(A, B, j),
						alt: null
					});
					j += interval;
				}
				if (turnovers[i].segment.length > 0) {
					this.determineBatch(turnovers[i].segment);
				}
			} else { // checking
				for (j = 0; j < turnovers[i].segment.length; j++) {
					if (!$defined(turnovers[i].segment[j].alt) || !turnovers[i].segment[j].alt) {
						okay = false;
					}
				}
			}
		}
		
		if (okay) {
			callback.apply(bindTo);
			return true;
		} else {
			(function() { // waiting until replenished, recursion
				this.replenish(callback, bindTo);
			}).delay(250, this);
			return false;
		}
	},
	getVyskopisCz: function() {
		if (!$defined(window.php.vyskopis) || !php.vyskopis) throw new Error('API key for Vyskopis.cz is not defined.'); // vyskopis api key
		if (!$defined(this.getVyskopisCz.script)) {
			this.getVyskopisCz.script = new TMRemoteScript('http://vyskopis.cz/api/getapi_v1.php?key=' + escape(php.vyskopis));
		}
		return this.getVyskopisCz.script;
	},
	determine: function(point) { // click
		try {
			this.askVyskopisCz(point);
		} catch (error) {
			this.askGeoNames(point);
		}
	},
	determineBatch: function(points) { // altitude profile
		this.askVyskopisCzBatch(points);
	},
	askVyskopisCz: function(point) {
	    this.getVyskopisCz();
		if ($defined(window.topoGetAltitude)) {
			this.getVyskopisCz().send(function (args) {
				var coords = args[0].coords;
				topoGetAltitude(coords.x, coords.y, args[1], args[0], 3000);
			}, [point, this.receive.bind(this)]);
		} else {
			(function() {
                this.askVyskopisCz(point);
			}).delay(10, this);
		}
	},
	askVyskopisCzBatch: function(points) {
		this.getVyskopisCz();
		if ($defined(window.topoGetAltitude)) {
			this.getVyskopisCz().send(function (args) {
				var points = args[0];
				var method = args[1];
				var tmp = [];
				for (var i = 0, c; i < points.length; i++) {
					c = points[i].coords;
					tmp.push([c.x, c.y, method, points[i]]);
				}
				topoGetAltitudes(tmp, 3000);
			}, [points, this.receive.bind(this)]);
		} else {
			(function() {
                this.askVyskopisCzBatch(points);
			}).delay(10, this);
		}
	},
	askGeoNames: function(point) {
		var coords = point.coords;
		var uri = 'http://ws.geonames.org/gtopo30JSON?lat=' + escape(coords.x) + '&lng=' + escape(coords.y);
		new TMRemoteAjax(uri).send(this.receive.bind(this), point);
	},
	askGeoNamesBatch: function(points) {
		for (var i = 0; i < points.length; i++) {
			this.askGeoNames(points[i]);
		}
	},
	receive: function(result, point) {
		if (!result) {
			this.askGeoNames(point);
		} else {
			if (typeof(result) == 'object') {
				point.alt = result.gtopo30;
			} else {
				point.alt = new Number(result);
			}
			
			this.trekmap.unlock();
		}
	}
});



/* Altitude chart ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TMAltitudeChart = new Class({
	type: 'TMAltitudeChart',
	trekmap: null,
	visible: false,
	driver: null,
	
	initialize: function(map) {
		this.trekmap = map;
		this.trekmap.gui.altitudeToggle
			.addEvent('click', this.toggle.bind(this))
			.setProperty('checked', this.visible);
		this.driver = this.trekmap.gui.altitudeDriver;
	},
	draw: function() {
		var points = this.trekmap.track.altitude.getAllPoints();
		
		// thin up the array
		points = this.trekmap.track.dilute(points, 100);
		
		// declarations and inits
		var i, ds = '', dMax = 0, alts = '', altMax = 0, altMin = 10000;
		
		// size
		var w = this.trekmap.gui.altitudeDriver.getStyle('width').toInt();
		w = (w > 1000)? 1000 : w;
		var h = this.trekmap.gui.altitudeDriver.getStyle('height').toInt();
		
		// searching for maximum altitude and maximum kilometers
		for (i = 0; i < points.length; i++) {
			altMax = Math.max(altMax, points[i].alt);
			altMin = Math.min(altMin, points[i].alt);
		}
		
		// last check
		if (isNaN(altMax) || isNaN(altMin)) {
			(function() { // waiting until replenished, recursion
				this.trekmap.track.altitude.replenish(this.draw, this);
			}).delay(10, this);
			return;
		}
		
		// lets continue
		altMax = Math.ceil(altMax / 100) * 100;
		altMin = Math.floor(altMin / 100) * 100;
		dMax = this.trekmap.track.meters;
		
		// percents of altitude and percents of meters
		for (i = 0; i < points.length; i++) {
			alts += (((points[i].alt - altMin) * 100) / (altMax - altMin)).toFixed(1) + ',';
			ds += ((points[i].meters * 100) / dMax).toFixed(1) + ',';
		}

		// chart
		var uri = 'http://chart.apis.google.com/chart?chxt=x,y&chxr=0,0,' + (dMax / TREKMAP_DISTANCE_RATIO).toFixed(1) + '|1,' + altMin + ',' + altMax + '&cht=lxy&chd=t:' + ds.slice(0, -1) + '|' + alts.slice(0, -1) + '&chs=' + w + 'x' + h + '&chco=' + TREKMAP_GREEN.slice(1) + '&chls=1,1,0';
		// debug(uri);
		this.trekmap.gui.altitudeDriver.setStyle('background', "url('" + uri + "') center no-repeat");
	},
	redraw: function() {
		if (!this.visible || !this.trekmap.track.isLine()) {
			this.trekmap.gui.altitudeDriver.setStyle('display', 'none');
			return;
		};
		
		// loading
		this.trekmap.gui.altitudeDriver.setStyles({
			display: 'block',
			width: $('trekmap').getStyle('width').toInt() + 'px',
			height: Math.ceil($('trekmap').getStyle('height').toInt() / 3) + 'px',
			background: "url('" + php.baseUri + "img/loading.gif') center no-repeat"
		});
		
		this.trekmap.track.altitude.replenish(this.draw, this);
	},
	toggle: function() {
		this.visible = !this.visible;
		this.redraw();
	}
});



/* Layers ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TMLayerIcon = AIcon.extend({
	initialize: function(filename) {
		this.parent({
			imageSrc: php.baseUri + 'img/'+filename+'.png',
			shadowSrc: null,
			fastRollover: false,
			imageSize: new ASize(22, 22),
			iconOffset: new APoint(11, 11)
		});
	}
});

var TMLayer = new Class({
	type: 'TMLayer',
	active: false,
	map: null,
	markers: {},
	icon: new TMLayerIcon('marker-general'),
	
	initialize: function(map) {
		this.map = map;
	},
	fetch: function() {
		; // abstract
	},
	setToggleDriver: function(el) {
		el = $(el);
		el.addEvent('click', this.toggle.bind(this));
		this.active = el.checked;
	},
	redraw: function() {
		if (this.active) this.fetch();
	},
	draw: function() {
		var i;
		if (this.active) for (i in this.markers) this.markers[i].show();
		else for (i in this.markers) this.markers[i].hide();
	},
	createMarker: function(lng, lat, text, bubble) {
		text = text || null;
		bubble = bubble || {};
		var hash = 'hash' + lng + ';' + lat;
		if (!$defined(this.markers[hash])) {
			var marker = new AMarker(new AGeoPoint(lng, lat), {
				title: text,
				icon: this.icon,
				clickable: true && text
			});
			if (text) marker.addEvent('onClick', function() { marker.showBubble(text, bubble); });
			this.markers[hash] = marker;
			return marker;
		}
		return false;
	},
    toggle: function() {
		this.active = !this.active;
		if (!this.active) {
			this.draw();
		} else {
			this.redraw();
		}
    }
});

var TMPanoramio = TMLayer.extend({
	icon: new TMLayerIcon('marker-photo'),
	markers: {},
	
	initialize: function(map) {
		this.parent(map);
		this.setToggleDriver($('tm-photos-toggle'));
	},
	fetch: function() {
		var bounds = this.map.getGeoBounds();
		bounds.southWest = bounds.southWest.convertTo(ACoordinateSystem.Geodetic);
		bounds.northEast = bounds.northEast.convertTo(ACoordinateSystem.Geodetic);
		
		var uri = 'http://www.panoramio.com/map/get_panoramas.php' +
		'?order=popularity' +
		'&set=public' +
		'&from=0&to=100' +
		'&minx=' +
		escape(bounds.southWest.y) +
		'&miny=' +
		escape(bounds.southWest.x) +
		'&maxx=' +
		escape(bounds.northEast.y) +
		'&maxy=' +
		escape(bounds.northEast.x) +
		'&size=small';
		
		new TMRemoteAjax(uri).send(this.receive.bind(this));
	},
	receive: function(data) {
		var markers = [];
		if (!$defined(data.photos)) return;
		for (var i = 0, photo, marker; i < data.photos.length; i++) {
			photo = data.photos[i];
			marker = this.createMarker(photo.latitude, photo.longitude,
				'<a href="'+photo.photo_url+'" style="width: 100%;text-align: center;" target="_blank"><img style="width: '+photo.width+'px;height: '+photo.height+'px;margin: 0 auto;margin-bottom: 1em;" src="'+photo.photo_file_url+'"></a>',
				{
					footerContent: '<small style="padding: 0.5em;"><a href="http://www.panoramio.com" target="_blank">Panoramio</a> &mdash; autor: <a href="'+photo.owner_url+'" target="_blank">'+photo.owner_name+'</a></small>',
					width: photo.width + 70,
					maxHeight: photo.height + 200
				}
			);
			if (marker != false) markers.push(marker);
		}
		this.map.addMarkers(markers);
		this.draw();
	}
});



var TMWikipedia = TMLayer.extend({
	icon: new TMLayerIcon('marker-wikipedia'),
	markers: {},
	
	initialize: function(map) {
		this.parent(map);
		this.setToggleDriver($('tm-wikipedia-toggle'));
	},
	fetch: function() {
		var center = this.map.getGeoCenter().convertTo(ACoordinateSystem.Geodetic);
        var radius = this.map.getCurrentScale() / 15000;
        
        var uri = 'http://ws.geonames.org/findNearbyWikipedia' +
        '?lat=' +
        escape(center.x) +
        '&lng=' +
        escape(center.y) +
        '&radius=' +
        escape(radius) +
        '&maxRows=50' +
        '&country=CZ' +
        '&lang=cs';
		
		new TMRemoteAjax(uri).send(this.receive.bind(this));
	},
	receive: function(data) {
		var markers = [];
		if (!$defined(data.entry)) return;
		for (var i = 0, entry, marker; i < data.entry.length; i++) {
			entry = data.entry[i];
			marker = this.createMarker(entry.lat, entry.lng,
				'<h3><a href="'+entry.wikipediaUrl+'" target="_blank">'+entry.title+'</a></h3>',
				{
					footerContent: '<small style="padding: 0.5em;"><a href="http://www.geonames.org" target="_blank">GeoNames</a></small>'
				} 
			);
			if (marker != false) markers.push(marker);
		}
		this.map.addMarkers(markers);
		this.draw();
	}
});



var TMWebCams = TMLayer.extend({
	icon: new TMLayerIcon('marker-webcam'),
	markers: {},
	
	initialize: function(map) {
		this.parent(map);
		this.setToggleDriver($('tm-webcams-toggle'));
	},
	fetch: function() {
		var center = this.map.getGeoCenter().convertTo(ACoordinateSystem.Geodetic);
		var radius = this.map.getCurrentScale() / 10000;
        
        var uri = 'http://api.webcams.travel/rest' +
        '?lat=' +
        escape(center.x) +
        '&lng=' +
        escape(center.y) +
		'&radius=' +
        escape(radius) +
		'&unit=km' +
        '&format=json' +
		'&per_page=50' +
		'&devid=68eef132bbeee006f6976d66daa96d5c' +
		'&method=wct.webcams.list_nearby';
		
		new TMRemoteAjax(uri).send(this.receive.bind(this));
	},
	receive: function(data) {
		var markers = [];
		var width = 128, height = 96;
		if (!$defined(data.webcams)) return;
		for (var i = 0, entry, marker; i < data.webcams.webcam.length; i++) {
			entry = data.webcams.webcam[i];
			marker = this.createMarker(entry.latitude, entry.longitude,
				'<strong>'+entry.title+'</strong><br><a href="'+entry.url+'" style="width: 100%;text-align: center;" target="_blank"><img style="width: '+width+'px;height: '+height+'px;margin: 0 auto;margin-bottom: 1em;" src="'+entry.thumbnail_url+'"></a>',
				{
					footerContent: '<small style="padding: 0.5em;"><a href="http://cz.webcams.travel/" target="_blank">Webcams.travel</a></small>',
					width: width + 70,
					maxHeight: height + 200
				}
			);
			if (marker != false) markers.push(marker);
		}
		this.map.addMarkers(markers);
		this.draw();
	}
});



var TMTopoNames = TMLayer.extend({
	icon: new AIcon({
		imageSrc: null,
		shadowSrc: null,
		fastRollover: false,
		imageSize: null,
		iconOffset: new APoint(0, 0),
		labelStyle: 'display: inline; white-space: nowrap; padding: 2px 5px; float: left; text-align: left; background-color: #393939; color: #FFF; font: bold 9px sans-serif;',
		labelOffset: new APoint(0, 0),
		className: 'poi',
		opacity: 0.65
	}),
	markers: {},
	
	initialize: function(map) {
		this.parent(map);
		this.setToggleDriver($('tm-toponames-toggle'));
	},
	createMarker: function(lng, lat, label) {
		var hash = 'hash' + lng + ';' + lat;
		if (!$defined(this.markers[hash])) {
			var marker = new AMarker(new AGeoPoint(lng, lat), {
				label: label,
				icon: this.icon
			});
			this.markers[hash] = marker;
			return marker;
		}
		return false;
	},
	fetch: function() {
		var center = this.map.getGeoCenter().convertTo(ACoordinateSystem.Geodetic);
        var radius = this.map.getCurrentScale() / 15000;
        
        var uri = 'http://ws.geonames.org/findNearbyJSON' +
        '?lat=' +
        escape(center.x) +
        '&lng=' +
        escape(center.y) +
		'&radius=' +
		escape(radius) +
		'&maxRows=50';
		
		new TMRemoteAjax(uri).send(this.receive.bind(this));
	},
	receive: function(data) {
		var markers = [];
		if (!$defined(data.geonames)) return;
		for (var i = 0, entry, marker; i < data.geonames.length; i++) {
			entry = data.geonames[i];
			marker = this.createMarker(entry.lat, entry.lng, entry.name);
			if (marker != false) markers.push(marker);
		}
		this.map.addMarkers(markers);
		this.draw();
	}
});



//var TMWeather = TMLayer.extend({
//	icon: new TMLayerIcon('weather-clear'),
//	
//	initialize: function(map) {
//		this.parent(map);
//		this.setToggleDriver($('tm-weather-toggle'));
//	},
//	fetch: function() {
//		var center = this.map.getGeoCenter().convertTo(ACoordinateSystem.Geodetic);
//        
//		var uri = 'http://ws.geonames.org/findNearByWeatherJSON' +
//        '?lat=' +
//        escape(center.x) +
//        '&lng=' +
//        escape(center.y) +
//		'&lang=cs';
//		alert(uri);
//		new TMRemoteAjax(uri).send(this.receive.bind(this));
//	},
//	receive: function(data) {
//		if (!$defined(data.weatherObservation)) return;
//		var entry = data.weatherObservation;
//		var marker = this.createMarker(entry.lat, entry.lng,
//			'<h3><a href="'+entry.wikipediaUrl+'" target="_blank">'+entry.title+'</a></h3>',
//			{
//				footerContent: '<small style="padding: 0.5em;"><a href="http://www.geonames.org" target="_blank">GeoNames</a></small>'
//			} 
//		);
//		if (marker != false) this.map.addMarkers([marker]);
//		this.draw();
//	}
//});



/* API loaders ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var TREKMAP_REMOTE_SCRIPT_CONTAINER = [];

var TMRemoteScriptThread = new Class({
	type: 'TMRemoteScriptThread',
	index: -1,
	master: null,
	script: null,
	callback: null,
	args: null,
	
	initialize: function(master) {
		this.master = master;
	},
	send: function(callback, args) {
		this.callback = callback;
		this.args = args;
		
		if (window.gecko) {
            this.script = new Element('script', {type: 'text/javascript'})
				.setHTML('TREKMAP_REMOTE_SCRIPT_CONTAINER[' + this.master.index + '].threads[' + this.index + '].launch();')
				.injectBefore(this.master.script);
		} else {
			TREKMAP_REMOTE_SCRIPT_CONTAINER[this.master.index].threads[this.index].launch();
		}
	},
	launch: function() {
		this.callback(this.args);
		(function() { // waiting until operation is closed
			this.master.terminate(this.index);
		}).delay(1000, this);
	}
});

var TMRemoteScript = new Class({
	type: 'TMRemoteScript',
	index: -1,
	script: null,
	threads: [],

	initialize: function(uri) {
		this.script = new Element('script', {src: new String(uri), type: 'text/javascript'})
			.injectTop(document.body);
		this.index = TREKMAP_REMOTE_SCRIPT_CONTAINER.push(this) - 1;
	},
	send: function(callback, args) {
		// prepare thread
		var i = this.threads.push(new TMRemoteScriptThread(this)) - 1;
		var thread = this.threads[i];
		thread.index = i;
		// send via thread
		thread.send(callback, args);
	},
	terminate: function(threadIndex) {
		if ($defined(this.threads[threadIndex].script)) {
			this.threads[threadIndex].script.remove();
		}
		delete this.threads[threadIndex];
	}
});

var TMRemoteAjax = new Class({
	type: 'TMRemoteAjax',
	callback: null,
	proxy: null,
	args: [],
	
	initialize: function(uri) {
		this.proxy = php.proxyUri + '?uri=' + escape(uri);
	},
	send: function(callback, args) {
		this.callback = callback;
		this.args = args || [];
		new Ajax(this.proxy, {
			method: 'get',
			onComplete: this.receive.bind(this)
		}).request();
	},
	receive: function(result) {
		this.callback(Json.evaluate(result), this.args);
	}
});



/* Run ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

window.addEvent('domready', function () {
	new TrekMap('trekmap');
});

