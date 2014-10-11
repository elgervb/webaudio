<?php
namespace app\page;

use core\mvc\IController;
use core\mvc\impl\json\Json;

use audio\scanner\DirScanner;
use core\utils\JsonUtils;
use core\utils\ModelUtils;
use core\Context;
use core\mvc\impl\redirect\Redirect;
use core\url\UrlUtils;
use core\download\DownloadAction;

/**
 * Index page
 */
class IndexController implements IController
{
	/**
	 * Shows a list of files to the user
	 *
	 * @return JSON A list of all files scanned
	 */
	public function indexAction()
	{
		$repository = \AppContext::get()->getRepository();
		return new Json($repository->search());
	}
	
	
	public function streamAction($aFile){
		$settings = \AppContext::get()->getSettings();
		$file = $settings->offsetGet('scanfolder') . DIRECTORY_SEPARATOR . $aFile;
		
		return new DownloadAction(new \SplFileInfo($file));
	}
	/**
	 * Scans the remote music library for music files
	 *
	 * @return Redirect Redirects the page to the index page to serve a list of files scanned
	 */
	public function scanAction(){
		// init: disable HTTP cache & set time limit to unlimited for large libraries
		Context::get()->getHttpContext()->getResponse()->disableCache();
		set_time_limit(0);

		$settings = \AppContext::get()->getSettings();
		
		// do the scan
		$files = DirScanner::scan($settings->offsetGet('scanfolder'), $settings->offsetGet('scanExtensions'));

		// remove the database
		$db = Context::get()->getBasePath(\AppContext::FILES_DB);
		if ($db->isFile()){
			unlink($db);
		}
		
		// create repository & database
		$repository = \AppContext::get()->getRepository();
		
		// save all models
		foreach ($files as $file){
			$model = ModelUtils::fileToModel($file);
			$repository->save($model);
		}
		
		return new Redirect(UrlUtils::siteUrl());
	}
}
