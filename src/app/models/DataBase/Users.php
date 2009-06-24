<?php

/**
 * User model.
 * 
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class Users extends DataBaseModel implements IAuthenticator {
	
	public function getAll() {
		return $this->db->dataSource('
			SELECT *
			FROM [users]
		');
	}
	
	public function update($id, $data) {
		$this->db->update('users', $data)->where('id = %i', $id)->execute();
	}
	
	public function fetchAdmin() {
		return $this->db->query('
			SELECT *
			FROM [users]
			WHERE [username] = %s
			LIMIT 1
		', Environment::getVariable('superadmin'))->fetch();
	}
	
	/**
	 * Performs an authentication.
	 */
	public function authenticate(array $credentials) {
		$row = $this->db->query('
			SELECT *
			FROM [users]
			WHERE [username] = %s
		', $credentials['username'])->fetch();

		// admin and ban check
		$admin = $active = array();
		if ($credentials['username'] == Environment::getVariable('superadmin')) { // admin
			$admin = array('admin' => 1);
			$active = array('active' => 1);
		} elseif ($row && !$row['active']) { // user
			throw new AuthenticationException('Zlý a všemocný administrátor ti zamezil přístup.');
		}

		$data = array_merge((array)$credentials['extra'], array(
			'username' => $credentials['username'],
		), $admin, $active);

		if (!$row) {
			$this->db->insert('users', $data)->execute();
		} else {
			if (array_key_exists('female', $data)) {
				unset($data['female']);
			}
			$this->db->update('users', $data)->where('id = %i', $row['id'])->execute();
		}

		$row = $this->db->query('
			SELECT *
			FROM [users]
			WHERE [username] = %s
		', $credentials['username'])->fetch();

		$roles = ($row['admin'])? array('admin') : array();
		return new Identity($row['username'], $roles, $row);
	}

}
