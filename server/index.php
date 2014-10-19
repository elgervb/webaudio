<?php

include 'phar://app/vendor/framework-1.1.0.phar';

core\ClassLoader::create()
  ->addClassPath('./app')
  ->addClassPath('./app/lib')
  ->addClassPath('./app/vendor');
core\FrontController::start();