<?php

/**
 * Achievements model.
 * 
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class Achievements extends DataBaseModel {
	
	public function insert($data) {
		$this->db->query('INSERT INTO [achievements]', $data);
	}
	
	public function fetchByTrack($id, $limit = NULL) {
		return $this->db->query('
			SELECT [ach].*, [t.name] AS [trackname], [u.fullname] AS [username], [u.email] AS [useremail], [u.female] AS [userfemale]
			FROM [achievements] AS [ach]
			JOIN [tracks] AS [t] ON [ach.track] = [t.id]
			JOIN [users] AS [u] ON [ach.user] = [u.id]
			WHERE [t.id] = %i
			ORDER BY [ach.achieved] DESC, [ach.id] DESC
		', $id)->fetchAll(NULL, $limit);
	}
	
	public function delete($id) {
		$this->db->query('
			DELETE FROM [achievements]
			WHERE [id] = %i
			LIMIT 1
		', $id);
	}
	
}
