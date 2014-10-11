<?php
use core\ClassLoader;

include '../../framework/core/Classloader.php';
$loader = ClassLoader::create();
$loader->addClassPath('app/lib');
core\FrontController::start();