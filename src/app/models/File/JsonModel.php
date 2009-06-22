<?php

/**
 * Access to data in JSON files.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class JsonModel extends TextFileModel {

	public $returnArray = FALSE;

	public function getContent() {
		return json_decode(parent::getContent(), $this->returnArray);
	}

}
