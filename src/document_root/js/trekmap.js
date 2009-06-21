var trekmap = new Object();
trekmap.mode = 'view';

// debug console
trekmap.dbg = function (message) { if ($defined($('trekmap-dbg'))) { new Element('p').setText(message).injectInside($('trekmap-dbg')); } }

// clicked
trekmap.points = [];
trekmap.lines = [];

// line
trekmap.line = new Object();
trekmap.line.clear = function() {
	for (var i = 0; i < trekmap.lines.length; i++) {
        trekmap.lines[i].remove();
	}
	trekmap.lines = [];
}
trekmap.line.update = function(points) { // TODO dodelat barvu jinak ... tak, aby si vypocitala kilometricky stred trasy a tam se zmenila na svetlejsi oranzovou
	trekmap.line.clear();

	var lines = [];
	for (var i = 0; i < trekmap.points.length - 1; i++) {
		lines.push([trekmap.points[i], trekmap.points[i + 1]]);
	}

	var line = null;
	var color = 0xF4552B;
	var interval = Math.ceil(trekmap.points.length / 20);
	
	for (var i = 0; i < lines.length; i++) {
        line = new APolyline(lines[i], {
			color: '#' + color.toString(16),
			weight: '4px',
			opacity: 1
		});
		
		trekmap.map.addOverlay(line);
		trekmap.lines.push(line);
		
		if (i % interval == 0) {
			color += 0x300;
		}
	}
}

// actions
trekmap.actions = new Object();

trekmap.actions.clear = new Object();
trekmap.actions.clear.validate = function() {
	return (trekmap.points.length > 0);
}
trekmap.actions.clear.process = function() {
	if (trekmap.actions.clear.validate() && confirm('Opravdu smazat vše na mapě?')) { // TODO dialog
		trekmap.map.removeAllOverlays();
		trekmap.map.removeAllMarkers();
		trekmap.points = [];
		trekmap.lines = [];
		trekmap.menu.update();
	}
}

trekmap.actions.undo = new Object();
trekmap.actions.undo.validate = function() {
	return (trekmap.points.length > 0);
}
trekmap.actions.undo.process = function() {
	if (trekmap.actions.undo.validate()) {
		if (trekmap.points.length == 2) {
	        trekmap.points.pop();
	        trekmap.points.pop();
	        trekmap.line.update();
	        trekmap.menu.update();
		} else {
		    trekmap.points.pop();
	        trekmap.line.update();
	        trekmap.menu.update();
		}
	}
}

trekmap.actions.finishLoop = new Object();
trekmap.actions.finishLoop.validate = function() {
	var firstSameAsLast = (trekmap.points[0] == trekmap.points[trekmap.points.length - 1]);
	return (!firstSameAsLast && trekmap.points.length > 0);
}
trekmap.actions.finishLoop.process = function() {
    if (trekmap.actions.finishLoop.validate()) {
	    trekmap.points.push(trekmap.points[0]);
        trekmap.line.update();
        trekmap.menu.update();
	}
}

trekmap.actions.sameWayBack = new Object();
trekmap.actions.sameWayBack.validate = function() {
    var firstSameAsLast = (trekmap.points[0] == trekmap.points[trekmap.points.length - 1]);
	return (!firstSameAsLast && trekmap.points.length > 0);
}
trekmap.actions.sameWayBack.process = function() {
    if (trekmap.actions.sameWayBack.validate()) {
		pts = trekmap.points.slice(0);
		pts.pop();
		pts.reverse();
		trekmap.points = trekmap.points.concat(pts);
		trekmap.line.update();
		trekmap.menu.update();
	}
}

// editation menu
trekmap.menu = new Object();
trekmap.menu.status = false;
trekmap.menu.show = function() {
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
	for (i = 0; i < btns.length; i++) {
        btn = new Element('button')
			.setText(btns[i].text)
			.injectInside(menu)
        btn.addEvent('click', btns[i].action.process);

		if ($defined(btns[i].action.validate)) { // can be validated?
			if (!btns[i].action.validate()) { // disabled?
				btn.setProperty('disabled', 'disabled');
			}
		}
	}

    trekmap.menu.status = true;
	return menu;
}
trekmap.menu.hide = function() {
	if ($defined($('trekmap-menu-fieldset'))) {
		$('trekmap-menu-fieldset').remove();
	}
	trekmap.menu.status = false;
}
trekmap.menu.toggle = function() {
	(trekmap.menu.status)? trekmap.menu.hide() : trekmap.menu.show();
}
trekmap.menu.update = trekmap.menu.show;

// mode manipulation
trekmap.setMode = function(mode) {
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
	
    trekmap.mode = mode;
	trekmap.map.update();
	trekmap.dbg(mode); // debug
}
trekmap.getMode = function() { return trekmap.mode; }
trekmap.toggleMode = function() {
	trekmap.setMode((trekmap.mode == 'view')? 'design' : 'view');
}

// click handler
trekmap.click = new Object();
trekmap.click.handler = function(object, point) {
	if (trekmap.mode == 'design') {
        trekmap.points.push(point);
        trekmap.menu.update();

		if (trekmap.points.length > 1) {
		    trekmap.line.update();
		}
	}
}

// initialization
window.addEvent('domready', function () { if ($defined($('trekmap'))) {
	// limit scales
	A_NORMAL_MAP.scaleInfos.splice(0, 3);
	A_PHOTO_MAP.scaleInfos.splice(0, 6);

    // core map instance
	var map = new AMap('trekmap', {
        showAtlasLogo: false,
        mapCursor: 'crosshair',
        onClick: trekmap.click.handler
	});

	// load maps
	map.loadMaps(new AGeoPoint(3546969, 5521970, ACoordinateSystem.S42), 0); // Czech Republic

	// controls
    map.addMapPart(new AMapTypeControl());
    map.addMapPart(new AMapLayerControl([A_CYCLE_MAP, A_TOURISTIC_MAP]));
    map.addMapPart(new ASmallMapControl());
    
    // menu
    $('trekmap-toggle-mode').addEvent('click', trekmap.toggleMode);
    
    // trekmap
    trekmap.map = map;
    trekmap.setMode('view'); // initialize mode
} });
