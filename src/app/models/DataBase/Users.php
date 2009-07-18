<?php

/**
 * User model.
 * 
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class Users extends DataBaseModel implements IAuthenticator {
	
	public function fetchAll() {
		return $this->db->query('
			SELECT *
			FROM [users]
			WHERE [active] = 1
			ORDER BY [id] DESC
		')->fetchAll();
	}
	
	public function fetch($id) {
		return $this->db->query('
			SELECT *
			FROM [users]
			WHERE [id] = %i
			AND [active] = 1
		', $id)->fetch();
	}
	
	public function update($id, $data) {
		$this->db->query('
			UPDATE [users] SET ', $data, 'WHERE [id] = %i
		', $id);
	}
	
	public function fetchAdmin() {
		return $this->db->query('
			SELECT *
			FROM [users]
			WHERE [username] = %s
			LIMIT 1
		', Environment::getVariable('superadmin'))->fetch();
	}
	
	public function fetchByHash($hash) {
		return $this->db->query('
			SELECT *
			FROM [users]
			WHERE SHA1(CONCAT([id], %s)) = %s
			AND [active] = 1
			LIMIT 1
		', Environment::getVariable('salt'), $hash)->fetch();
	}
	
	public function hash($id) {
		return sha1($id . Environment::getVariable('salt'));
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
			throw new AuthenticationException('Účet není aktivní.');
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
	
	public function hasTrack($id, $track) {
		$result = $this->db->query('
			SELECT [user]
			FROM [tracks_users]
			WHERE [user] = %i AND [track] = %i
			LIMIT 1
		', $id, $track);
		return (bool)count($result);
	}
	
	public function hasAchievement($id, $ach) {
		$result = $this->db->query('
			SELECT [user]
			FROM [achievements]
			WHERE [user] = %i AND [id] = %i
			LIMIT 1
		', $id, $ach);
		return (bool)count($result);
	}

}
