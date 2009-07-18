<?php

/**
 * Track model.
 * 
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class Tracks extends DataBaseModel {
	
	const RANGE = 50; // kilometers
	const ONE_DEG_LAT_IN_KM = 111;
	const ONE_DEG_LNG_IN_KM = 72;
	
	public function insert($author, $data) {
		$track = json_decode($data);
		$description = (strlen($track->description) > 0)? (string)$track->description : NULL;
		
		$this->db->query('
			INSERT INTO [tracks]
			([id], [author], [length], [altitude], [articulation], [created], [name], [description])
			VALUES(NULL, %i, %i, %i, %i, NOW(), %s, %s)
		', (int)$author, $track->length, $track->altitude, $track->articulation, $track->name, $description);
		$id = $this->db->insertId();
		
		// insert points
		$points = array();
		foreach ($track->points as $p) {
			$points[] = array(
				'track' => (int)$id,
				'lat' => (double)$p->coords->x,
				'lng' => (double)$p->coords->y,
				'alt' => (int)$p->alt,
			);
		}
		$this->db->query('INSERT INTO [points] %ex', $points);
		
		// insert relation
		$this->db->query('INSERT INTO [tracks_users]', array('track' => (int)$id, 'user' => (int)$author));
		
		return $id;
	}
	
	public function update($id, $data) {
		$this->db->query('
			UPDATE [tracks]
			SET ', $data, 'WHERE [id] = %i
		', $id);
	}
	
	public function add($id, $user) {
		$this->db->query('
			INSERT INTO [tracks_users]
			([track], [user])
			VALUES(%i, %i)
		', $id, $user);
	}
	
	public function delete($id, $user) {
		$count = $this->db->query('
			SELECT COUNT([t.id])
			FROM [users] AS [u]
			JOIN [tracks_users] AS [tu] ON [u.id] = [tu.user]
			JOIN [tracks] AS [t] ON [t.id] = [tu.track]
			WHERE [t.id] = %i
		', $id)->fetchSingle();
		
		// delete the relation
		$this->db->query('
			DELETE FROM [tracks_users]
			WHERE [track] = %i AND [user] = %i
			LIMIT 1
		', $id, $user);
		
		if ($count < 2) { // only this user had it, delete it completely
			$this->db->query('
				DELETE FROM [tracks]
				WHERE [id] = %i
				LIMIT 1
			', $id); // cascade in database
			return TRUE;
		}
		return FALSE;
	}
	
	public function fetch($id) {
		$track = $this->db->query('
			SELECT [t].*, [u.fullname] AS [authorname], [u.female] AS [authorfemale]
			FROM [tracks] AS [t]
			JOIN [users] AS [u]
			ON [t.author] = [u.id]
			WHERE [t.id] = %i
			LIMIT 1
		', $id);
		
		if (!count($track)) return array();
		$track = (array)$track->fetch();
		
		// points
		$points = (array)$this->db->query('
			SELECT *
			FROM [points]
			WHERE [track] = %i
		', $id)->fetchAll();
		
		$track['points'] = array();
		foreach ($points as $p) {
			$track['points'][] = array(
				'coords' => array('x' => $p['lat'], 'y' => $p['lng']),
				'alt' => $p['alt']
			);
		}
		
		return $track;
	}
	
	public function fetchByUser($id) {
		$tracks = $this->db->query('
			SELECT [t].*, [u.fullname] AS [authorname], [u.female] AS [authorfemale], (
				SELECT COUNT([a.id])
				FROM [achievements] AS [a]
				WHERE [a.track] = [t.id]
			) AS [achievements]
			FROM [tracks] AS [t]
			JOIN [tracks_users] AS [tu] ON [tu.track] = [t.id]
			JOIN [users] AS [u] ON [t.author] = [u.id]
			WHERE [tu.user] = %i
			ORDER BY [t.created] DESC
		', $id);
		
		if (!count($tracks)) return array();
		$tracks = $tracks->fetchAssoc('id');
		
		// find their points
		$points = (array)$this->db->query('
			SELECT [track], [lat], [lng], [alt]
			FROM [points]
			WHERE [track] IN (', array_keys($tracks), ')
			ORDER BY [id] ASC
		')->fetchAll();
		
		// connect points with tracks
		foreach ($points as $p) {
			if (empty($tracks[$p['track']]['points'])) {
				$tracks[$p['track']]['points'] = array();
			}
			$tracks[$p['track']]['points'][] = (array)$p;
		}
		
		// return result
		return (array)$tracks;
	}
	
	public function geocode($expression) {
		$point = NULL;
		$response = @file_get_contents("http://maps.google.com/maps/geo?q=" . rawurlencode($expression) . "&output=json&oe=utf8&gl=cz&sensor=false&key=" . Environment::getVariable('google'));
		if (empty($response)) {
			throw new InvalidStateException('Empty geocoding response.');
		} else {
			$response = json_decode($response);
			if ($response->Status->code >= 500 && $response->Status->code <= 601) {
				throw new InvalidStateException('Error code in geocoding response.');
			} elseif ($response->Status->code == 200 && $response->Placemark[0]->AddressDetails->Country->CountryNameCode == 'CZ') {
				$point = $response->Placemark[0]->Point->coordinates;
				$point = array(
					'lng' => (double)$point[0],
					'lat' => (double)$point[1],
				);
			}
		}
		return $point;
	}
	
	public function fetchNearby($point) {
		// point & bounds
		$point = array(
			'lat' => (double)$point['lat'],
			'lng' => (double)$point['lng']
		);
		$min = array(
			'lat' => $point['lat'] - self::RANGE * (1 / self::ONE_DEG_LAT_IN_KM),
			'lng' => $point['lng'] - self::RANGE * (1 / self::ONE_DEG_LNG_IN_KM),
		);
		$max = array(
			'lat' => $point['lat'] + self::RANGE * (1 / self::ONE_DEG_LAT_IN_KM),
			'lng' => $point['lng'] + self::RANGE * (1 / self::ONE_DEG_LNG_IN_KM),
		);
		
		// search for nearby tracks
		$tracks = $this->db->query('
			SELECT DISTINCT [t.id], [t].*, [u.fullname] AS [authorname], [u.female] AS [authorfemale], (
				SELECT COUNT([a.id])
				FROM [achievements] AS [a]
				WHERE [a.track] = [t.id]
			) AS [achievements]
			FROM [points] AS [p]
			JOIN [tracks] AS [t] ON [p.track] = [t.id]
			JOIN [users] AS [u] ON [t.author] = [u.id]
			WHERE [p.lat] > %f AND [p.lng] > %f AND [p.lat] < %f AND [p.lng] < %f
			ORDER BY SQRT(POW([p.lat] - %f, 2) + POW([p.lng] - %f, 2)) ASC, [t.created] DESC
		', $min['lat'], $min['lng'], $max['lat'], $max['lng'], $point['lat'], $point['lng']);

		if (!count($tracks)) return array();
		$tracks = $tracks->fetchAssoc('id');
			
		// find their points
		$points = (array)$this->db->query('
			SELECT [track], [lat], [lng], [alt]
			FROM [points]
			WHERE [track] IN (', array_keys($tracks), ')
			ORDER BY [id] ASC
		')->fetchAll();
		
		// connect points with tracks
		foreach ($points as $p) {
			if (empty($tracks[$p['track']]['points'])) {
				$tracks[$p['track']]['points'] = array();
			}
			$tracks[$p['track']]['points'][] = (array)$p;
		}
		
		// return result
		return (array)$tracks;
	}
	
	public function fetchNewest($limit, $lite = FALSE) {
		$tracks = $this->db->query('
			SELECT [t].*, [u.fullname] AS [authorname], [u.female] AS [authorfemale], (
				SELECT COUNT([a.id])
				FROM [achievements] AS [a]
				WHERE [a.track] = [t.id]
			) AS [achievements]
			FROM [tracks] AS [t]
			JOIN [users] AS [u]
			ON [t.author] = [u.id]
			ORDER BY [t.created] DESC
			LIMIT %i
		', $limit);
		
		if (!count($tracks)) return array();
		$tracks = $tracks->fetchAssoc('id');
		
		if (!$lite) {
			// find their points
			$points = (array)$this->db->query('
				SELECT [track], [lat], [lng], [alt]
				FROM [points]
				WHERE [track] IN (', array_keys($tracks), ')
				ORDER BY [id] ASC
			')->fetchAll();
			
			// connect points with tracks
			foreach ($points as $p) {
				if (empty($tracks[$p['track']]['points'])) {
					$tracks[$p['track']]['points'] = array();
				}
				$tracks[$p['track']]['points'][] = (array)$p;
			}
		}
		
		// return result
		return (array)$tracks;
	}
	
}
