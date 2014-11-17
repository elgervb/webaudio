<?php
namespace app\page;

use core\mvc\impl\http\HttpStatus;

use core\utils\JsonUtils;

use id3\Id3v2;
use id3\Id3Exception;

use core\mvc\IController;
use core\mvc\impl\json\Json;

use audio\scanner\DirScanner;
use core\utils\ModelUtils;
use core\Context;
use core\mvc\impl\redirect\Redirect;
use core\url\UrlUtils;
use core\download\DownloadAction;
use core\filesystem\Filesystem;
use core\logging\Logger;

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
		set_time_limit(60);
		$repository = \AppContext::get()->getRepository();
		$sc = $repository->createSearchCriteria();
		$sc->orderBy("artist, album, track, title, path");
		return new Json($repository->search($sc));
	}
	
	public function testAction(){
		$id3 = new Id3v2();
		$id3->read( '\\\\pc04258\\Music\\Boards of Canada\\Geogaddi\\18 - over the horizon radar.mp3');
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
		$scanner = new DirScanner();
		$files = $scanner->scan($settings->offsetGet('scanfolder'), $settings->offsetGet('scanExtensions'));

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
			
			try{
				$tags = $id3->read( $settings->offsetGet('scanfolder') . DIRECTORY_SEPARATOR . $model->{'path'} );
				$model->{'id3'} = $tags->{'id3'};
				$model->{'album'} = $tags->{'album'};
				$model->{'artist'} = $tags->{'artist'};
				$model->{'genre'} = $tags->{'genre'};
				$model->{'title'} = $tags->{'title'};
				$model->{'year'} = $tags->{'year'};
				$model->{'track'} = $tags->{'track'};
				$model->{'length'} = $tags->{'length'};
			}catch(Id3Exception $ex){
				//
			}
			
			$repository->save($model);
		}
		
		return new Redirect(UrlUtils::siteUrl());
	}
	
	/**
	 * Stream a audio track back to the client
	 * 
	 * @param string $aGuid the GUID identifier of the audio track
	 * 
	 * @return 
	 */
	public function streamAction($aGuid){
		$settings = \AppContext::get()->getSettings();
		$repository = \AppContext::get()->getRepository();
		$sc = $repository->createSearchCriteria()->where("guid", $aGuid);
		$result = $repository->search($sc);
		
		if ($result->count() > 0){
			$model = $result->offsetGet(0);
			$file = $settings->offsetGet('scanfolder') . DIRECTORY_SEPARATOR . $model->{"path"};
			
			return new DownloadAction(new \SplFileInfo($file));
		}
		
		Logger::get()->logWarning("Could not find audio track with GUID " . $aGuid);
		return new HttpStatus(404);
	}
}
