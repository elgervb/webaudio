<?php

namespace audio\scanner;

class DirScanner{
	/**
	 * Scans a directory for files with the given extensions
	 * @param string|\SplFileInfo $aDir
	 * @param array $aExtensions
	 * @return \CallbackFilterIterator|boolean
	 */
	public static function scan($aDir, array $aExtensions){
		$dirIterator = new \RecursiveDirectoryIterator( $aDir );
		$dirIterator->setInfoClass('audio\scanner\SecureFileInfo');
		
		return new \CallbackFilterIterator(
			new \RecursiveIteratorIterator(
				$dirIterator,\RecursiveIteratorIterator::CHILD_FIRST
			),
			function($current, $key, $iterator) use ($aDir, $aExtensions){
				/* @var $current \SecureFileInfo */
				$current->setRelativePath($aDir);

				return $current->isFile() &&  in_array($current->getExtension(), $aExtensions);
			}
		);
	}
}