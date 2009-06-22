<?php

/**
 * Remote RSS file.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class RemoteFeed extends RemoteModel {
	
	public $expiration;
	
	public function __construct($uri) {
		parent::__construct($uri);
		$this->expiration = 60 * 30 * rand(2, 8); // 1-4 hours
	}
	
	public function getData() {
		$content = $this->getRemoteContent($this->expiration, 'feed');
		$xml = @simplexml_load_string($content);
		if ($xml === FALSE) {
			throw new IOException("File is not valid XML.");
		}
		return $xml;
	}

}
