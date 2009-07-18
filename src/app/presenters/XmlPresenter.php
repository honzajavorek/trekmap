<?php

/**
 * XML channel presenter.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class XmlPresenter extends BasePresenter {

	const RSS_ITEMS = 10;
	
	protected $ext = '.xml';
	
	protected function startup() {
		parent::startup();
		
		Debug::disableProfiler(); // disables profiler
		$this->setLayout(FALSE); // disables layout
		$this->absoluteUrls = TRUE; // switching to absolute URLs
		
//		Environment::getHttpResponse()
//			->setHeader('Content-Description', 'File Transfer');
			
		$this->ext = '.' . $this->getView();
	}
	
	public function setFilename($string) {
//		Environment::getHttpResponse()
//			->setHeader('Content-Disposition', 'attachment; filename="' . String::webalize($string) . $this->ext . '"');
	}
	
	public function fetchTracks() {
		$feed = new Tracks;
		$tracks = $feed->fetchNewest(self::RSS_ITEMS, TRUE);

		$max = 0;
		$items = array();
		foreach ($tracks as $track) {
			$link = $this->link('Track:item', $track['id']);
			$items[] = array(
				'title' => $track['name'],
				'link' => $link, 'guid' => $link,
				'description' => $track['description'],
				'author' => $track['authorname'],
				'pubDate' => date('r', strtotime($track['created'])),
			);
			$max = max($max, strtotime($track['created']));
		}
		$max = ($max)? date('r', $max) : date('r');
		
		return array(
			'params' => $this->params,
			'title' => 'TrekMap - Trasy',
			'description' => $this->template->metaDescription,
			'pubDate' => $max,
			'items' => $items,
		);
	}
	
	public function fetchSearch($param) {
		if (strrchr($param, ';') === FALSE) {
			throw new BadRequestException('Bad format of coordinates.');
		} else {
			$point = explode(';', $param);
			$point = array(
				'lng' => (double)$point[0],
				'lat' => (double)$point[1],
			);
			
			$feed = new Tracks;
			$tracks = $feed->fetchNearby($point);
		}

		$max = 0;
		$items = array();
		foreach ($tracks as $track) {
			$link = $this->link('Track:item', $track['id']);
			$items[] = array(
				'title' => $track['name'],
				'link' => $link, 'guid' => $link,
				'description' => $track['description'],
				'author' => $track['authorname'],
				'pubDate' => date('r', strtotime($track['created'])),
			);
			$max = max($max, strtotime($track['created']));
		}
		$max = ($max)? date('r', $max) : date('r');

		return array(
			'params' => $this->params,
			'title' => "TrekMap - Trasy v okolí „{$param}“",
			'description' => $this->template->metaDescription,
			'pubDate' => $max,
			'items' => $items,
		);
	}
	
	public function fetchAchievementsByTrack($param) {
		$feed = new Achievements;
		$achs = $feed->fetchByTrack($param, self::RSS_ITEMS);
		
		$max = 0;
		$items = array();
		foreach ($achs as $ach) {
			$link = $this->link('Track:item', $ach['track']);
			$items[] = array(
				'title' => "$ach[username]: $ach[activity]",
				'link' => $link, 'guid' => $link,
				'description' => "Čas: $ach[time], kola: $ach[laps], převýšení: $ach[altitude], km: $ach[distance], km/h: $ach[speed], min/km: $ach[pace].",
				'author' => $ach['username'],
				'pubDate' => date('r', strtotime($ach['achieved'])),
			);
			$max = max($max, strtotime($ach['achieved']));
		}
		$max = ($max)? date('r', $max) : date('r');
		
		return array(
			'params' => $this->params,
			'title' => "TrekMap - Výkony na trase „{$ach['trackname']}“",
			'description' => $this->template->metaDescription,
			'pubDate' => $max,
			'items' => $items,
		);
	}
	
	public function beforeRender() {
		if ($this->getView() == 'rss') {
			$method = preg_replace_callback('~\\-([a-z])~', create_function(
	            '$matches',
	            'return strtoupper($matches[1]);'
	        ), $this->params['id']);
			$method = 'fetch' . ucfirst($method);
			$this->template->data = $this->$method($this->params['param']);
		}
	}
	
	public function renderKml($id, $user = NULL) {
		$t = new Tracks;
		$track = $t->fetch($track);
		
		$this->template->id = $track['id'];
		$this->template->name = $track['name'];
		$this->setFilename($track['name'], 'gpx');
		
		$this->template->author = $track['author'];
		$this->template->authorname = $track['authorname'];
		$this->template->description =
			"Trasu vytvořil" . (($track['authorfemale'])? 'a' : '') .
			" $track[authorname]. $track[description]";
		$this->template->coordinates = array();
		
		foreach ($track['points'] as $point) {
			$this->template->coordinates[] = array(
				'lng' => $point['coords']['y'],
				'lat' => $point['coords']['x'],
			);
		}
		
		if ($user) {
			$u = new Users;
			$user = $u->fetchByHash($user);
			if (empty($user)) throw new BadRequestException('User not found.');
			if (!$u->hasTrack($user['id'], $track['id'])) throw new BadRequestException("This user doesn't have required track.");

			$this->template->name .= " ($user[fullname])";
			
			// TODO ukladani userovych markeru, notes, photos, ...
		}
	}
	
	public function renderGpx($id, $user = NULL) {
		$t = new Tracks;
		$track = $t->fetch($track);
		
		$this->template->id = $track['id'];
		$this->template->name = $track['name'];
		$this->setFilename($track['name'], 'gpx');
		
		$this->template->author = $track['author'];
		$this->template->authorname = $track['authorname'];
		$this->template->description =
			"Trasu vytvořil" . (($track['authorfemale'])? 'a' : '') .
			" $track[authorname]. $track[description]";
		$this->template->coordinates = array();
		
		foreach ($track['points'] as $point) {
			$this->template->coordinates[] = array(
				'lng' => $point['coords']['y'],
				'lat' => $point['coords']['x'],
			);
		}
		
		if ($user) {
			$u = new Users;
			$user = $u->fetchByHash($user);
			if (empty($user)) throw new BadRequestException('User not found.');
			if (!$u->hasTrack($user['id'], $track['id'])) throw new BadRequestException("This user doesn't have required track.");

			$this->template->name .= " ($user[fullname])";
			
			// TODO ukladani userovych markeru, notes, photos, ...
		}
	}

}
