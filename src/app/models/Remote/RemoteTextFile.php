<?php

/**
 * Remote plaintext data.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class RemoteTextFile extends RemoteModel {

	public function getData() {
		return $this->getRemoteContent();
	}

}
