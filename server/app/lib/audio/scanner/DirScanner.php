<?php

namespace audio\scanner;

class DirScanner{
	
		public static function scan($aDir){
			$dirIterator = new \RecursiveDirectoryIterator( $aDir );
			$dirIterator->setInfoClass('audio\scanner\SecureFileInfo');
			
			return new \CallbackFilterIterator(
				new \RecursiveIteratorIterator(
					$dirIterator,\RecursiveIteratorIterator::CHILD_FIRST
				),
				function($current, $key, $iterator) use ($aDir){
					/* @var $current \SecureFileInfo */
					$current->setRelativePath($aDir);

					return $current->isFile() && $current->getExtension() === 'mp3';
				}
			);
		}
	}