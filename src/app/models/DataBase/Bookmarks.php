<?php

/**
 * Bookmark model.
 * 
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class Bookmarks extends DataBaseModel {
	
	public function insert($data) {
		$unique = dechex(time()).dechex(mt_rand(1, 65535)); // http://cz2.php.net/manual/en/function.uniqid.php#71933
		$this->db->query('
			INSERT INTO [bookmarks]
			([id], [track], [saved])
			VALUES(%s, %s, NOW())
		', $unique, $data);
		
		// delete old pieces
		$this->db->query('
			DELETE FROM [bookmarks]
			WHERE [saved] < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
		');
		
		// return $this->db->insertId();
		return $unique;
	}
	
	public function fetch($id) {
		return $this->db->query('
			SELECT [track]
			FROM [bookmarks]
			WHERE [id] = %s
			LIMIT 1
		', $id)->fetchSingle();
	}
	
}
