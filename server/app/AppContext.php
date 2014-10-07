<?php
use core\mvc\impl\repository\SQLiteRepository;
use core\mvc\impl\repository\SQLiteDynamicModelConfiguration;

class AppContext {
	
	const DB_DIR = "cache";
	const FILES_DB = '/cache/audioserver.sqlite';
	const FILES_CREATE_QUERY = '/cache/audioserver.sql';
	
	private static $instance;
	
	public function __construct(){
		self::$instance = $this;
	}
	
	public static function get(){
		if (!self::$instance){
			self::$instance = new AppContext();
		}
		return self::$instance;
	}
	
	public function getRepository(){
		$beginQuery = "";
		if (!is_file(__DIR__ .self::FILES_DB)){
			$beginQuery = file_get_contents(__DIR__ . self::FILES_CREATE_QUERY);
		}
		
		$repository = new SQLiteRepository(new SQLiteDynamicModelConfiguration("files"), 'sqlite:'.__DIR__.self::FILES_DB, $beginQuery );
		$repository->getModelConfiguration()->setPrimaryKeyFieldName("guid");
		$repository->getModelConfiguration()->setIdGeneration("guid");
		
		return $repository;
	}
}
