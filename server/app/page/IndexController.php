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
	
	/**
	 * Scans the remote music library for music files
	 *
	 * @return Redirect Redirects the page to the index page to serve a list of files scanned
	 */
	public function scanAction(){

		// init: disable HTTP cache & set time limit to unlimited for large libraries
		Context::get()->getHttpContext()->getResponse()->disableCache();
		set_time_limit(0);

		// do the scan
		$files = DirScanner::scan('\\\\pc04258\\Music');

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
