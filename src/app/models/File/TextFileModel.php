<?php

/**
 * Access to data in plaintext files.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class TextFileModel extends Object {

	/**
	 * Full path to the text file to be loaded.
	 *
	 * @var string
	 */
	protected $file;

	public function __construct($file) {
		if (!in_array(SafeStream::PROTOCOL, stream_get_wrappers())) {
			SafeStream::register();
		}
		$this->file = $file;
	}

	public function getContent() {
		if (is_file($this->file)) {
			return file_get_contents(SafeStream::PROTOCOL . "://$this->file");
		} else {
			throw new FileNotFoundException("File '$this->file' not found.");
		}
	}

}
