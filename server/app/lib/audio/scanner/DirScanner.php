<?php
namespace audio\scanner;

use utils\CallbackFilterIterator;
use core\filesystem\Filesystem;
use core\logging\Logger;

class DirScanner{
	
	private $preservePath;
	
	public function __construct($aPreservePath = false){
		$this->preservePath = $aPreservePath;	
	}
	/**
	 * Scans a directory for files with the given extensions
	 * @param string|\SplFileInfo $aDir
	 * @param array $aExtensions
	 * @return \CallbackFilterIterator|boolean
	 */
	public function scan($aDir, array $aExtensions){
		$dirIterator = new \RecursiveDirectoryIterator( $aDir );
		Logger::get()->logFine("Scan folder " . $aDir);
		if (!$this->preservePath){
			$dirIterator->setInfoClass('audio\scanner\SecureFileInfo');
		}
		
		$preservePath = $this->preservePath;
		
		return new CallbackFilterIterator(
			new \RecursiveIteratorIterator(
				$dirIterator,\RecursiveIteratorIterator::CHILD_FIRST
			),
			function($current, $key, $iterator) use ($aDir, $aExtensions, $preservePath){
				if (!$preservePath){
					/* @var $current \audio\scanner\SecureFileInfo */
					$current->setRelativePath($aDir);
				}

				return $current->isFile() &&  in_array(Filesystem::getExtension( $current ), $aExtensions);
			}
		);
	}
}