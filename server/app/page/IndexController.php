<?php
namespace app\page;

use id3\Id3v2;

use core\mvc\IController;
use core\mvc\impl\json\Json;

use audio\scanner\DirScanner;
use core\utils\JsonUtils;
use core\utils\ModelUtils;
use core\Context;
use core\mvc\impl\redirect\Redirect;
use core\url\UrlUtils;
use core\download\DownloadAction;
use core\filesystem\Filesystem;

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

		$settings = \AppContext::get()->getSettings();
		
		// do the scan
		$files = DirScanner::scan($settings->offsetGet('scanfolder'), $settings->offsetGet('scanExtensions'));

		// remove the database
		$db = Context::get()->getBasePath('app/'.\AppContext::FILES_DB);
		if ($db->isFile()){
			Filesystem::deleteFile($db);
		}
		
		// create repository & database
		$repository = \AppContext::get()->getRepository();
		$id3 = new Id3v2();
		
		// save all models
		foreach ($files as $file){
			$model = ModelUtils::fileToModel($file);
			
			$tags = $id3->read( $settings->offsetGet('scanfolder') . DIRECTORY_SEPARATOR . $model->{'path'} );
			$model->{'id3'} = $tags->{'id3'};
			$model->{'album'} = $tags->{'album'};
			$model->{'artist'} = $tags->{'artist'};
			$model->{'genre'} = $tags->{'genre'};
			$model->{'title'} = $tags->{'title'};
			$model->{'year'} = $tags->{'year'};
			
			$repository->save($model);
		}
		
		return new Redirect(UrlUtils::siteUrl());
	}
	
	public function streamAction($aFile){
		$settings = \AppContext::get()->getSettings();
		$file = $settings->offsetGet('scanfolder') . DIRECTORY_SEPARATOR . $aFile;
	
		return new DownloadAction(new \SplFileInfo($file));
	}
}
