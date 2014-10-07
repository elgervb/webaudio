<?php

namespace audio\scanner;

class SecureFileInfo extends \SplFileInfo{
		private $relPath;
		public function setRelativePath($aPath){
			$this->relPath = str_replace('\\', '/',$aPath);
		}
		public function getPath(){
			return $this->secure(parent::getPath());
		}
		public function getPathName(){
			return $this->secure(parent::getPathname());
		}
		private function secure($aPath){
			$parent = str_replace('\\', '/', $aPath);
			return str_replace($this->relPath, '',  $parent);
		}
	}