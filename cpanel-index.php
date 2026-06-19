<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// cPanel: public_html/index.php should point to ~/Book-Shop-Pos/public files.
define('LARAVEL_START', microtime(true));

define('APP_BASE_PATH', dirname(__DIR__) . '/Book-Shop-Pos');
define('APP_PUBLIC_PATH', APP_BASE_PATH . '/public');

if (file_exists($maintenance = APP_BASE_PATH . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

require APP_BASE_PATH . '/vendor/autoload.php';

/** @var Application $app */
$app = require_once APP_BASE_PATH . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
