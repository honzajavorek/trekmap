# TrekMap

My BSc Thesis called _Evidence of user's geographic traces_. Web service to provide mapping and profiling your run or walk. Formerly had it's home at trekmap.cz.

It was something like a Czech copy of MapMyRun, or if you want, predecessor of RunKeeper. It was build on top of Amapy.cz's API, it had a shitload of features and a very good support for touristic/cycling routes. I had some plans with it, but later they just faded away and now, in time of RunKeeper, Endomondo, DailyMile, etc., it would have no sense in reviving such idea.

## Installation

It's an old [Nette](http://www.nette.org) project with a lot of JavaScript (ancient version of MooTools). It probably doesn't even work any more as it's map provider, Amapy.cz, has shut down thir API. If you want to get this project run, have fun with reverse engineering.

There are some screenshots in the PDF - see below.

## Thesis document

You can read my thesis by downloading a [PDF file](https://github.com/downloads/honzajavorek/trekmap/projekt.pdf) here from GitHub. You can read part of it's analysis in form of [article at Zdrojak.cz](http://www.zdrojak.cz/clanky/api-k-ceskym-turistickym-mapam/).

### Initial instructions

1. Study API of available services such as maps, altitude, weather, etc. in the world and for Czech Republic.
2. Suggest the best solution of map tracking, showing stats, altitude, etc. Suggest some extra layers from other web resources, cooperation with GPS, etc.
3. Deliver sample web application with these properties.
4. Sum up possibilities of connection with other services, API, advanced technologies such as microformats, sharing saved routes with other users etc.

### Abstract

_(copy & paste from document)_

This Bachelor thesis describes a problem of creating a web service, in which user can mark his or her own track of free-time activity (such as running) into an interactive map. Application is built up on so-called mashup, an architecture in which program represents a connection of many external services and resources of data. These are approachable thanks to their application interfaces. Thesis step by step deals with an analysis of all services with API and by a design of the web service. After all describes some details of solution and implementation of selected problems.

## Grade: A

Reader suggested A, supervisor suggested A, I got A. And I won Dean Award for the best BSc thesis.

## License: ISC

© 2009 Jan Javorek &lt;<a
href="mailto:jan.javorek&#64;gmail.com">jan.javorek&#64;gmail.com</a>&gt;

This work is licensed under [ISC license](https://en.wikipedia.org/wiki/ISC_license).
