<?php

/**
 * Universal database model.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
abstract class DataBaseModel extends Object {

	protected $db;

	public function __construct() {
		$this->db = dibi::getConnection();
	}
	
	/**
	 * Returns last generated ID by database or FALSE.
	 * 
	 * @return int|FALSE
	 */
	protected function insertId($sequence = NULL, $ignore = FALSE) {
		try {
			return $this->db->insertId($sequence);
		} catch (DibiException $e) {
			if ($ignore) return FALSE;
			else throw $e;
		}
	}
	
	public function begin() { $this->db->begin(); }
	public function rollback() { $this->db->rollback(); }
	public function commit() { $this->db->commit(); }

}
