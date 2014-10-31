<?php
namespace id3;

use core\mvc\impl\Model;

use core\logging\Logger;
use core\io\reader\StreamReader;
/**
 * @see http://www.id3.org/id3v2.3.0
 */
class Id3v2
{
	private static $tags = array('AENC' => 'audio encryption' , 'APIC' => 'attached picture' , 'COMM' => 'comment' , 'TALB' => 'album' , 'TCOM' => 'composer' , 'TCON' => 'genre' , 'TCOP' => 'copyright' , 'TENC' => 'encoder' , 'TIT2' => 'title' , 'TLE' => 'length', 'TLEN' => 'length', 'TPE1' => 'artist' , 'TPE2' => 'ensemble' , 'TRCK' => 'track' , 'TYER' => 'year' , 'WXXX' => 'url');
	private static $genres = array(  0=>"Blues",  1=>"Classic Rock",  2=>"Country",  3=>"Dance",  4=>"Disco",  5=>"Funk",  6=>"Grunge",  7=>"Hip-Hop",  8=>"Jazz",  9=>"Metal", 10=>"New Age", 11=>"Oldies", 12=>"Other", 13=>"Pop", 14=>"R&B", 15=>"Rap", 16=>"Reggae", 17=>"Rock", 18=>"Techno", 19=>"Industrial", 20=>"Alternative", 21=>"Ska", 22=>"Death Metal", 23=>"Pranks", 24=>"Soundtrack", 25=>"Euro-Techno", 26=>"Ambient", 27=>"Trip-Hop", 28=>"Vocal", 29=>"Jazz+Funk", 30=>"Fusion", 31=>"Trance", 32=>"Classical", 33=>"Instrumental", 34=>"Acid", 35=>"House", 36=>"Game", 37=>"Sound Clip", 38=>"Gospel", 39=>"Noise", 40=>"AlternRock", 41=>"Bass", 42=>"Soul", 43=>"Punk", 44=>"Space", 45=>"Meditative", 46=>"Instrumental Pop", 47=>"Instrumental Rock", 48=>"Ethnic", 49=>"Gothic", 50=>"Darkwave", 51=>"Techno-Industrial", 52=>"Electronic", 53=>"Pop-Folk", 54=>"Eurodance", 55=>"Dream", 56=>"Southern Rock", 57=>"Comedy", 58=>"Cult", 59=>"Gangsta", 60=>"Top 40", 61=>"Christian Rap", 62=>"Pop/Funk", 63=>"Jungle", 64=>"Native American", 65=>"Cabaret", 66=>"New Wave", 67=>"Psychadelic", 68=>"Rave", 69=>"Showtunes", 70=>"Trailer", 71=>"Lo-Fi", 72=>"Tribal", 73=>"Acid Punk", 74=>"Acid Jazz", 75=>"Polka", 76=>"Retro", 77=>"Musical", 78=>"Rock & Roll", 79=>"Hard Rock", 80=>"Folk", 81=>"Folk-Rock", 82=>"National Folk", 83=>"Swing", 84=>"Fast Fusion", 85=>"Bebob", 86=>"Latin", 87=>"Revival", 88=>"Celtic", 89=>"Bluegrass", 90=>"Avantgarde", 91=>"Gothic Rock", 92=>"Progressive Rock", 93=>"Psychedelic Rock", 94=>"Symphonic Rock", 95=>"Slow Rock", 96=>"Big Band", 97=>"Chorus", 98=>"Easy Listening", 99=>"Acoustic",100=>"Humour",101=>"Speech",102=>"Chanson",103=>"Opera",104=>"Chamber Music",105=>"Sonata",106=>"Symphony",107=>"Booty Bass",108=>"Primus",109=>"Porn Groove",110=>"Satire",111=>"Slow Jam",112=>"Club",113=>"Tango",114=>"Samba",115=>"Folklore",116=>"Ballad",117=>"Power Ballad",118=>"Rhythmic Soul",119=>"Freestyle",120=>"Duet",121=>"Punk Rock",122=>"Drum Solo",123=>"A capella",124=>"Euro-House",125=>"Dance Hall");

	private function decTag( $aTag, $aContent, $aFlags )
	{
		if ('APIC' === $aTag){
			return $aContent;
		}
		
		$encoding = count($aFlags) >= 4 ? $aFlags[3] : 3; 
		//mb_convert_encoding is corrupted in some versions of PHP so I use iconv
		switch ($encoding)
		{
			case 0: //ISO-8859-1
				return trim( iconv( 'UTF-8', 'ISO-8859-1', trim( $aContent ) ) );
			case 1: //UTF-16 BOM
				return trim( iconv( 'UTF-16LE', 'UTF-8',  $aContent ) );
			case 2: //UTF-16BE
				return trim( iconv( 'UTF-16BE', 'UTF-8', $aContent ) );
			default: //UTF-8
				return trim( $aContent );
		}
		return false;
	}
	
	/**
	 * Read the ID3 tags of a Mp3 file
	 *
	 * @param $aFilePath string
	 *
	 * @return array with key => value pairs
	 *        
	 * @throws \Exception
	 */
	public function read( $aFilePath )
	{
		$path = $aFilePath instanceof \SplFileInfo ? $aFilePath->getPathname() : $aFilePath;
		
		$result = new Model();
		$result->{'path'} = $path;
		
		if (!is_readable($path)){
			return $result;
		}
		$reader = new StreamReader( $path );
		$reader->open();
		
		$binRead = $reader->read( 10 );
		try{
			$header = unpack( "a3signature/c1version_major/c1version_minor/c1flags/Nsize", $binRead );
		}
		catch ( \ErrorException $ex){
			Logger::get()->logWarning( 'Unable to unpack IDv3 header');
			return $result;
		}
		$totalSize = $header['size'];
		$fileSize = filesize($path);

		if ($totalSize >= $fileSize){
			$reader->close();
			throw new Id3Exception( 'Size read from header is larger than the file itself... s' );
		}
		
		if (! $header['signature'] == 'ID3')
		{
			$reader->close();
			throw new Id3Exception( 'This file does not contain ID3 v2 tag (' . $path . ')', Id3Exception::CODE_NO_ID3_TAG_FOUND );
		}
		
		Logger::get()->logFinest( "Found ID3V2." . $header['version_major'] . "." . $header['version_minor'] . " of total size " . $header['size'] . ' for file ' . $path);

		$result->{'size'} = $header['size'];
		$result->{'id3'} = $header['signature'] . "v" . $header['version_major'] . "." . $header['version_minor'] . "." . $header['flags'];
		
		if ($header['version_major'] < 2){
			Logger::get()->logError( 'Non compatible ID3 version found ' . $result->{'id3'} );
			$reader->close();
			return $result;
		}

		$endRead = str_repeat( pack( 'x' ), 4 );
		while ($reader->getBytesRead() < $header['size'])
		{
			$tag = $reader->read( 4 );
			$totalSize -= 4;
			if ($tag === $endRead || ! preg_match( "/[a-z0-0]/i", $tag ))
			{
				$reader->close();
				return $result;
			}
			
			$binRead = $reader->read( 4 );
			$totalSize -= 4;
			$size = unpack( 'N', $binRead );
			$size = $size[1]; 
			
			if ($size > 0)
			{
				$binRead = $reader->read( 2 );
				$totalSize -= 2;
				$flags = unpack( 'c2', $binRead );
				
				if (($header['size'] - $reader->getBytesRead() - $size) < 0)
				{
					Logger::get()->logWarning( "Tried to read more than allowed for file " . $path . ' on tag ' . $tag );
					break;
				}
			
				$totalSize -= $size;
				if($totalSize < 0){
					Logger::get()->logWarning( "Tried to read more than allowed for file " . $path . ' on tag ' . $tag );
					break;
				}
				$value = $reader->read( $size );
				
				$key = (isset( self::$tags[$tag] ) ? self::$tags[$tag] : $tag);
				
				if ($key === 'PRIV')
				{
					continue; // We're not interested in PRIV
				}
				else if($key == "genre"){
					$result->{$key} = $this->genre( $this->decTag( $tag, $value, $flags ) );	
				}
				else{
					$result->{$key} = $this->decTag( $tag, $value, $flags );
				}
			}
		}
		
		$reader->close();
		return $result;
	}
	
	private function genre($aValue){
		$match = preg_match("/\(([0-9]+)\)/i", $aValue);
		if ($match){
			return self::$genres[$match];
		}else if(is_numeric($aValue)){
			return self::$genres[$aValue];
		}
		return $aValue;
	}
}