/**
 * TrekMap helpers.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2009 Jan Javorek
 * @package    Javorek
 */

/* Compatibility ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function debug(msg) { new Element('span').setText('' + msg + ' ').injectTop(document.body); }
function apiMissing() { return (undefined === window.MooTools || undefined === window.AMap); }

// MooTools required, AMapy required
if (apiMissing()) { throw new Error('MooTools and/or AMapy are undefined.'); }
// php is global variable with some basic config and info from server side
if (!$defined(window.php)) { throw new Error('Global variable php is undefined.'); }



/* Confirmations ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

window.addEvent('domready', function () {
	var confirmer = function(event) {
		event = new Event(event);
		info = this.getProperty('title') || '';
		if (!window.confirm(info + ' Opravdu pokračovat?')) {
			event.stop();
		}
	};
	$$('.confirm').each(function(el) {
		el.addEvent('click', confirmer);
	});
});



/* Flash messages ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

window.addEvent('domready', function () {
	// makes flashes temporary
	var hider = function() {
		this.remove();
	};
	$$('.flashes .flash').each(function(el) {
		if (el.hasClass('info')) {
			hider.delay(5000, el);
		}
		if (!el.hasClass('permanent') && !el.hasClass('error')) {
			el.addEvent('click', hider.bind(el));
			el.setStyle('cursor', 'pointer');
		}
	});
});


