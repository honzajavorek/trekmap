<?php

/**
 * INI files.
 * 
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class IniModel extends TextFileModel {

	public $processSections = FALSE;

	public function getContent() {
		if (is_file($this->file)) {
			return parse_ini_file(SafeStream::PROTOCOL . "://$this->file", $this->processSections);
		} else {
			throw new FileNotFoundException("File '$this->file' not found.");
		}
	}

}
