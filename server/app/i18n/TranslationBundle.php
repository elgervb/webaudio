<?php
namespace app\i18n;

use app\Bootstrap;

use core\translations\bundle\ITranslationBundle;

class TranslationBundle implements ITranslationBundle
{
	/**
	 * (non-PHPdoc)
	 * 
	 * @see core\translations\bundle.ITranslationBundle::getLanguage()
	 */
	public function getLanguage()
	{
		return "en";
	}
	
	/**
	 * (non-PHPdoc)
	 * 
	 * @see core\translations\bundle.ITranslationBundle::getTranslations()
	 */
	public function getTranslations()
	{
		$t = array();
		
		return $t;
	}
}