<?php

/**
 * Activities model.
 * 
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class Activities extends DataBaseModel {
	
	const EASY = 'easy';
	const MEDIUM = 'medium';
	const HARD = 'hard';
	
	const EASY_CEIL = 75;
	const MEDIUM_CEIL = 200;

/*
	http://cs.wikipedia.org/wiki/Typ_georeli%C3%A9fu
	
	název					výšková členitost	nadmořská výška
	rovina					do 30 m
	plochá pahorkatina		30 - 75 m			200 - 450 m
	členitá pahorkatina		75 - 150 m			450 - 600 m
	plochá vrchovina		150 - 200 m			600 - 750 m
	členitá vrchovina		200 - 300 m			750 - 900 m
	plochá hornatina		300 - 450 m			900 - 1200 m
	členitá hornatina		450 - 600 m			1200 - 1600 m
	velehornatina			více než 600 m		nad 1600 m
*/
	
	public function fetchAll() {
		$result = $this->db->query('
			SELECT DISTINCT [name]
			FROM [activities]
			ORDER BY [name] ASC
		');
		$names = array();
		foreach ($result as $entry) {
			$names[] = $entry['name'];
		}
		return $names;
	}
	
	public function fetch($name, $articulation = NULL, $speed = NULL) {
		if ($articulation <= self::EASY_CEIL) {
			$terrain = self::EASY;
		} elseif ($articulation > self::EASY_CEIL && $articulation < self::MEDIUM_CEIL) {
			$terrain = self::MEDIUM;
		} elseif ($articulation >= self::MEDIUM_CEIL) {
			$terrain = self::HARD;
		}
		
		return $this->db->query('
			SELECT *, ABS([speed] - %f) AS [_distance]
			FROM (
				SELECT *
				FROM [activities]
				WHERE [name] = %s
				AND ([terrain] IS NULL OR [terrain] = %s)
			) AS [filtered]
			ORDER BY [_distance] ASC
			LIMIT 1
		', $speed, $name, $terrain)->fetch();
	}
	
}
