<?php

/**
 * Bootstrap.
 * 
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */

/*
 * Load nette
 */
require LIBS_DIR . '/Nette/loader.php';

/*
 * Enable Debug for better exception and error visualisation
 */
//if (!Environment::isProduction()) { Debug::enableProfiler(); }
Debug::enable(Debug::DETECT, NULL, Environment::getVariable('email')); // Debug::DEVELOPMENT

/*
 * Load configuration from config.ini file
 */
$config = Environment::loadConfig();

/*
 * Check if directory /app/temp is writable
 */
if (@file_put_contents(Environment::expand('%tempDir%/_check'), '') === FALSE) {
	throw new Exception("Make directory '" . Environment::getVariable('tempDir') . "' writable!");
}

/*
 * Enable RobotLoader - this allows load all classes automatically
 */
$loader = new RobotLoader();
$loader->addDirectory(APP_DIR);
$loader->addDirectory(LIBS_DIR);
$loader->register();

/*
 * Setup sessions
 */
$session = Environment::getSession();
$session->setSavePath(APP_DIR . '/sessions/');

/*
 * Get and setup a front controller
 */
$application = Environment::getApplication();
$application->errorPresenter = 'Error';

/*
 * Database connection
 */
dibi::connect($config->database);

/*
 * HTML vs XHTML
 */
Html::$xhtml = FALSE;

/*
 * Setup application router
 */
$router = $application->getRouter();

Route::setStyleProperty('presenter', Route::FILTER_TABLE, array(
        'ucet' => 'Account',
        'trasy' => 'Track',
		'export' => 'Xml',
));

Route::setStyleProperty('action', Route::FILTER_TABLE, array(
        'vytvorit' => 'create',
        'upravit' => 'edit',
		'borci' => 'users',
		'borec' => 'user',
		'demo' => 'demo',
        'info' => 'info',
		'trasa' => 'item',
		'napoveda' => 'help',
		'hledam' => 'results',
));

$router[] = new Route('<action borec|trasa>/<id [0-9]+>', array(
	'presenter' => 'Track',
));

$router[] = new Route('<presenter proxy|ucet|trasy>/<action>/<id>', array(
	'action' => 'default',
	'id' => NULL,
));

$router[] = new Route('<presenter export>/<id>.<action kml|gpx|rss> ? param=<param>', array(
	'param' => NULL,
));

$router[] = new Route('<action>/<id>', array(
	'presenter' => 'Default',
	'action' => 'default',
	'id' => NULL,
));

// RoutingDebugger::run();

/*
 * Run the application!
 */
$application->run();
