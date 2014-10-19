<?php
namespace id3;

class Id3Exception extends \Exception
{
	const CODE_NO_ID3_TAG_FOUND = 20000;
	
	public function __construct($aMsg, $aCode){
		parent::__construct($aMsg, $aCode);
	}
}