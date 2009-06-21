<?php

/*
 * Load nette
 */
require LIBS_DIR . '/Nette/loader.php';

/*
 * Enable Debug for better exception and error visualisation
 */
//if (!Environment::isProduction()) { Debug::enableProfiler(); }
Debug::enable(Debug::DETECT, NULL, Environment::getVariable('email'));

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
        'uzivatele' => 'User',
        'trasy' => 'Track',
));

Route::setStyleProperty('action', Route::FILTER_TABLE, array(
        'vytvorit' => 'create',
        'upravit' => 'edit',
		'demo' => 'demo',
        'info' => 'info',
		'moje' => 'my',
));

$router[] = new Route('<presenter uzivatele|trasy>/<id [0-9]+>/', array(
	'action' => 'item',
));

$router[] = new Route('<presenter ucet|uzivatele|trasy>/<action>/<id>/', array(
	'action' => 'default',
	'id' => NULL,
));

$router[] = new Route('<action>/<id>/', array(
	'presenter' => 'Default',
	'action' => 'default',
	'id' => NULL,
));

//RoutingDebugger::run();

/*
 * Run the application!
 */
$application->run();
