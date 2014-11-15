<?php
use core\mvc\impl\repository\SQLiteRepository;
use core\mvc\impl\repository\SQLiteDynamicModelConfiguration;
use core\Context;

class AppContext {
	
	const DB_DIR = "cache";
	const FILES_DB = '/app/cache/audioserver.sqlite';
	const FILES_CREATE_QUERY = '/app/cache/audioserver.sql';
	const SETTINGS_FILE = 'settings.json';
	
	private static $instance;
	
	public function __construct(){
		self::$instance = $this;
	}
	
	/**
	 * Gets the instance of AppContext
	 * 
	 * @return AppContext
	 */
	public static function get(){
		if (!self::$instance){
			self::$instance = new AppContext();
		}
		return self::$instance;
	}
	
	/**
	 * Get the audioserver database
	 * 
	 * @return IModelRepository
	 */
	public function getRepository(){
		$beginQuery = "";
		if (!is_file(Context::get()->getBasePath(self::FILES_DB))){
			
			$beginQuery = file_get_contents( Context::get()->getBasePath(self::FILES_CREATE_QUERY) );
		}
		
		$repository = new SQLiteRepository(new SQLiteDynamicModelConfiguration("files"), 'sqlite:'.Context::get()->getBasePath(self::FILES_DB), $beginQuery );
		$repository->getModelConfiguration()->setPrimaryKeyFieldName("guid");
		$repository->getModelConfiguration()->setIdGeneration("guid");
		
		return $repository;
	}
	
	/**
	 * Returns the settings 
	 * 
	 * @return \ArrayObject
	 */
	public function getSettings(){
		$json = file_get_contents(__DIR__. DIRECTORY_SEPARATOR. self::SETTINGS_FILE);
		return new ArrayObject(json_decode($json, true));
	}
}
