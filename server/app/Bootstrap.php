<?php
namespace app;

use core\Context;
use core\IBootstrap;
use core\logging\Logger;
use core\logging\decorator\impl\LogDecorator;
use core\logging\recorder\impl\BufferedFileRecorder;
use core\mvc\impl\view\Layout;
use core\routing\impl\Router;
use core\routing\impl\Route;
use core\translations\Translator;
use core\url\UrlUtils;

include_once 'AppContext.php';

final class Bootstrap implements IBootstrap
{
	/**
	 * @var String Version 1.0.0
	 */
	const VERSION = "1.0.0";
	const LANG = "en";
	
	/**
	 * (non-PHPdoc)
	 *
	 * @see \core\IBootstrap::createLayout()
	 */
	public function createLayout()
	{
		return null;
	}
	
	/**
	 * (non-PHPdoc)
	 *
	 * @see \core\IBootstrap::createRouter()
	 */
	public function createRouter()
	{
		$router = new Router();
		$router->register( 'index', Route::create( Route::ROUTE_ROOT )->setController( "Index" )->setAction( "index" ) );
		$router->register( 'scan', Route::create( '^/scan$' )->setController( "Index" )->setAction( "scan" ) );
		
		return $router;
	}
	
	public function getLanguage()
	{
		return self::LANG;
	}
	
	public function getVersion()
	{
		return self::VERSION;
	}
	
	/**
	 * Checks if we are local
	 */
	private function isLocal()
	{
		return $_SERVER['REMOTE_ADDR'] === 'localhost' || $_SERVER['REMOTE_ADDR'] === '127.0.0.1';
	}
	
	/**
	 * (non-PHPdoc)
	 *
	 * @see \core\IBootstrap::init()
	 */
	public function init()
	{
		$recorder = new BufferedFileRecorder( Context::get()->getLogDir(), new LogDecorator() );
		new Logger( $recorder, Logger::ALL );
		Translator::get()->addBundle( new \app\i18n\TranslationBundle() );
	}
}