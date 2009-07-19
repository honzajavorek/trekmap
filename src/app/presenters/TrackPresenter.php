<?php

/**
 * Track presenter.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class TrackPresenter extends BasePresenter {

	protected function startup() {
		parent::startup();
		$this->template->isMyProfile = FALSE;
	}

	/********************* view default *********************/

	private function getSearchForm($default, $size = 40) {
		$form = new AppForm($this, 'searchTrack');

		$form->addText('s', 'Kde to má být?', $size)
		->addRule(Form::FILLED, 'To přece není až tak těžká otázka, ne?');
		$form->addSubmit('btn', 'Hledat');

		$form->onSubmit[] = array($this, 'searchTrack');
		$form->setMethod('get');
		$form->setDefaults(array('s' => $default));

		return $form;
	}

	public function prepareDefault() {
		$default = NULL;
		if (Environment::getUser()->isAuthenticated()) {
			$default = Environment::getUser()->getIdentity()->place;
		}
		$this->template->form = $this->getSearchForm($default, 80);
	}

	public function searchTrack(AppForm $form) {
		$data = $form->getValues();
		$this->redirect('Track:results', $data['s']);
	}

	public function renderDefault() {
		$this->template->title = 'Trasy';

		// newest
		$t = new Tracks;
		$tracks = $t->fetchNewest(5, TRUE);
		$this->template->tracks = $tracks;

		$this->template->feeds[] = array(
			'title' => $this->template->title,
			'link' => $this->link('Xml:rss?id=tracks'),
		);
	}

	/********************* view results *********************/

	public function actionResults($id = NULL) {
		if (empty($id)) {
			$this->redirect('Track:default');
		}

		$tracks = new Tracks;
		$point = NULL;
		if (strrchr($id, ';') !== FALSE) { // coordinates
			// coordinates
			$point = explode(';', $id);
			$point = array(
				'lng' => (double)$point[0],
				'lat' => (double)$point[1],
			);
		} else {
			// geocoding
			try {
				$point = $tracks->geocode($id);
			} catch (InvalidStateException $e) {
				$this->flashMessage('Vyskytla se chyba. <small>' . $e->getMessage() . '</small>', 'error');
				return;
			}
		}

		// none
		if (!$point) {
			$this->flashMessage('Místo nebylo nalezeno.');
			$this->redirect('Track:default');
			return;
		}

		// fetch nearby
		$tracks = $tracks->fetchNearby($point);
		$this->template->point = "$point[lng];$point[lat]";

		// to template
		$datagrid = new TracksDataGrid($tracks);
		$this->addComponent($datagrid, 'tracks');
		$this->template->tracks = $datagrid;
	}

	public function prepareResults($id = NULL) {
		$this->template->form = $this->getSearchForm($id, 25);
	}

	public function renderResults($id = NULL) {
		$this->template->title = "Trasy v okolí „{$id}“";
		$this->template->cssLayout = 'layout-wide';
		$this->template->id = $id;

		$this->template->feeds[] = array(
			'title' => $this->template->title,
			'link' => $this->link('Xml:rss?id=search&param=' . $id),
		);
	}

	/********************* view item *********************/

	private $isMine = NULL; // do not use directly!
	public function isMine($id) {
		if ($this->isMine === NULL) {
			if (Environment::getUser()->isAuthenticated()) {
				$u = new Users;
				$this->isMine = $u->hasTrack(Environment::getUser()->getIdentity()->id, $id);
			} else {
				$this->isMine = FALSE;
			}
		}
		return $this->isMine;
	}

	public function actionItem($id) {
		$this->template->isMine = $this->isMine($id);
		$this->template->cssLayout = 'layout-wide layout-map';
	}

	public function prepareItem($id) {
		if ($this->isMine($id)) {
			// form
			$form = new AppForm($this, 'createAchievement');

			$a = new Activities;
			$activities = $a->fetchAll();
			$activities = array_merge(array(-1 => ''), $activities);

			$form->addText('achieved', 'Kdy?', 11, 11)
			->addRule(Form::FILLED, 'Není vyplněno datum.')
			->addRule(Form::REGEXP, 'Datum musí být ve tvaru DD.MM.RRRR.', '/\\d{2}.\\d{2}.\\d{4}/')
			->setValue(date('d.m.Y'));
			$form->addSelect('activity','Typ aktivity', $activities)
			->skipFirst()
			->addRule(Form::FILLED, 'Není vyplněn typ aktivity.');
			$form->addText('time', 'Čas', 8, 8)
			->setEmptyValue('00:00:00')
			->addRule(Form::FILLED, 'Není vyplněn čas.')
			->addRule(Form::REGEXP, 'Čas musí být ve tvaru HH:MM:SS.', '/\\d{2}:\\d{2}:\\d{2}/');
			$form->addText('laps', 'Počet kol', 2, 2)
			->addRule(Form::FILLED, 'Není vyplněn počet kol.')
			->addRule(Form::NUMERIC, 'Čas musí být číslo.')
			->setValue(1);

			$form->addSubmit('btn', 'Přidat');

			$form->onSubmit[] = array($this, 'createAchievement');
			$this->template->form = $form;
		}

		// map component
		$map = new TrekMap(TrekMap::VIEW);
		$this->addComponent($map, 'map');
		$this->template->map = $map;

		// achievements component
		$a = new Achievements;
		$achs = $a->fetchByTrack($id);
		$achs = new AchievementsDataGrid($achs);
		$this->addComponent($achs, 'achievements');
		$this->template->achievements = $achs;
	}

	public function createAchievement(AppForm $form) {
		$this->authenticate();
		$identity = Environment::getUser()->getIdentity();

		// track
		$t = new Tracks;
		$track = $t->fetch($this->params['id']);
		if (empty($track)) throw new BadRequestException('Item not found.'); // exists?

		// form data
		$data = $form->values;

		// date check
		list($d, $m, $y) = explode('.', $data['achieved']);
		$date = "$y-$m-$d";
		if ($date === FALSE || strcmp(date('Y-m-d', $date), date('Y-m-d')) > 0) {
			$form->addError('Datum je nesmyslné.');
			return;
		}

		// stats
		list($h, $m, $s) = explode(':', $data['time']);
		$hours = $h + ($m / 60) + ($s / (60 * 60));
		$minutes = $hours * 60;
		$km = ($track['length'] / 1000) * $data['laps'];
		$speed = $km / $hours;
		$pace = $minutes / $km;
		$altitude = $track['altitude'] * $data['laps'];

		// activity
		$act = new Activities;
		$activities = $act->fetchAll();
		$name = $activities[$data['activity'] - 1];
		$activity = $act->fetch($name, $track['articulation'], $speed);

		// energy
		$energy = NULL;
		if ($identity->weight) {
			$energy = $activity['ratio'] * $minutes * $identity->weight;
		}

		// insert achievement
		$ach = new Achievements;
		$ach->insert(array(
			'user' => $identity->id,
			'track' => $track['id'],
			'activity' => $activity['name'],
			'time' => $data['time'],
			'laps' => $data['laps'],
			'achieved' => $date,
			'altitude' => $altitude,
			'distance' => $km,
			'speed' => $speed,
			'pace' => $pace,
			'energy' => $energy,
		));

		$this->flashMessage('Výkon byl v pořádku přidán.');
		//$this->redirect('Track:item', $track['id']);
	}

	public function renderItem($id) {
		// track
		$t = new Tracks;
		$track = $t->fetch($id);

		// exists?
		if (empty($track)) throw new BadRequestException('Item not found.');

		// track
		$this->template->title = $track['name'];
		$this->template->track = $track;
		$this->template->map->setTrack($track);
		
		// google maps link
		$this->absoluteUrls = TRUE;
		$this->template->googleMapsLink = 'http://maps.google.com/maps?hl=cs&q=' . rawurlencode($this->link('Xml:kml', $track['id'])) . '&ie=UTF-8';
		$this->absoluteUrls = FALSE;
		
		// rss
		$this->template->feeds[] = array(
			'title' => $this->template->title,
			'link' => $this->link('Xml:rss?id=achievements-by-track&param=' . $id),
		);
	}

	/********************* view edit *********************/

	public function actionEdit($id, $request) {
		$this->authenticate();
	}

	public function prepareEdit($id, $request) {
		$form = new AppForm($this, 'editTrack');

		$form->addText('name', 'Název', 25, 200)
		->addRule(Form::FILLED, 'Bez názvu to nejde.');
		$form->addTextArea('description', 'Stručný popis trasy', 25, 4);
		$form->addSubmit('btn', 'Uložit');

		$form->onSubmit[] = array($this, 'editTrack');
		$this->template->form = $form;
	}

	public function editTrack(AppForm $form) {
		$this->authenticate();
		$data = $form->getValues();

		$t = new Tracks;
		$t->update($this->params['id'], $data);

		$this->flashMessage('Vše bylo v pořádku uloženo!');
		if ($this->params['request']) $this->getApplication()->restoreRequest($this->params['request']);
		else $this->redirect('Track:item', $this->params['id']);
	}

	public function handleBack($id, $request) {
		if ($request) $this->getApplication()->restoreRequest($request);
		else $this->redirect('Track:item', $id);
	}

	public function renderEdit($id, $request) {
		$this->template->title = 'Úprava trasy';
		$this->template->id = $id;
		$this->template->request = $request;

		$t = new Tracks;
		$track = $t->fetch($id);

		// exists?
		if (empty($track)) throw new BadRequestException('Item not found.');

		$this->template->form->setDefaults($track);
	}

	/********************* view create *********************/

	protected function createComponent($name) {
		switch ($name) {
			case 'description':
				$form = new AppForm();
				$form->addTextArea('desc', 'Stručný popis trasy', 25, 4);
				$this->addComponent($form, 'description');
				break;
				
			case 'map':
				$map = new TrekMap(TrekMap::EDIT);
				$this->addComponent($map, 'map');
				break;
				
			default:
				parent::createComponent($name);
				break;
		}
	}

	public function renderCreate() {
		// settings
		$this->template->title = 'Vytvořit novou trasu';
		$this->template->cssLayout = 'layout-wide layout-map';

		// components
		$this->template->form = $this->getComponent('description');
		$this->template->map = $this->getComponent('map');

		// set place
		$place = (string)Environment::getUser()->getIdentity()->place;
		if (!empty($place)) {
			$this->getComponent('map')->setPlace($place);
		}
	}

	public function handleSave($track) {
		$this->payload->uri = NULL;
		if (!empty($track)) {
			$t = new Tracks;
			$id = $t->insert(Environment::getUser()->getIdentity()->id, (string)$track);
			$this->payload->uri = $this->link(':Track:item', $id);
		}
		$this->terminate();
	}

	/********************* view user *********************/

	public function isMyProfile($id) {
		return Environment::getUser()->isAuthenticated() && Environment::getUser()->getIdentity()->id == $id;
	}

	public function actionUser($id) {
		$this->template->isMyProfile = $this->isMyProfile($id);
		$this->template->cssLayout = 'layout-wide';
	}

	public function prepareUser($id) {
		if ($this->isMyProfile($id)) {
			// form
			$form = new AppForm($this, 'createTrack');
				
			$form->addText('name', 'Název', 50, 100)
				->addRule(Form::FILLED, 'Bez názvu to nejde.')
				->addRule(Form::LENGTH,'Název musí mít od %d do %d znaků.', array(3, 100));
			$form->addCheckbox('toggle', 'Mám soubor (GPX, KML)')
				->addCondition(Form::EQUAL, TRUE)
				->toggle('import-file');
			$form->addFile('file', 'Soubor');
			$form->addSubmit('btn', 'Hurá na to');
				
			$form->onSubmit[] = array($this, 'createTrack');
			$this->template->form = $form;
		}

		// tracks component
		$tracks = new Tracks;
		$tracks = $tracks->fetchByUser($id);

		$datagrid = new TracksDataGrid($tracks);
		$this->addComponent($datagrid, 'tracks');
		$this->template->tracks = $datagrid;
	}

	protected function parseFile($contents) {
		$xml = simplexml_load_string(str_replace('xmlns=', 'blinded=', $contents)); // hack to blind namespaces and get xpath working
		$points = array();
		if ($xml === FALSE) {
			throw new IOException("XML can't be parsed.");
		}
		if ($xml->getName() == 'gpx') { // gpx
			list($track) = $xml->xpath('//trk');
			foreach ($track->trkseg as $segment) {
				foreach ($segment->trkpt as $point) {
					$points[] = array(
						'coords' => array('x' => (double)$point->attributes()->lat, 'y' => (double)$point->attributes()->lon),
						'alt' => (!empty($point->ele))? (int)$point->ele : NULL,
					);
				}
			}
		} elseif ($xml->getName() == 'kml') { // kml
			list($track) = $xml->xpath('//LineString');
			$matches = array();
			preg_match_all(
				'~(-?\\d+(\\.\\d+)?),(-?\\d+(\\.\\d+)?)(,(-?\\d+(\\.\\d+)?))?~',
				$track->coordinates,
				$matches
			);
			for ($i = 0; $i < count($matches[0]); $i++) {
				 $points[] = array(
					'coords' => array('y' => (double)$matches[1][$i], 'x' => (double)$matches[3][$i]),
				 	'alt' => (!empty($matches[6][$i]))? (int)$matches[6][$i] : NULL,
				);
			}
		} else {
			throw new IOException("Unsupported format.");
		}
		if (empty($points)) {
			throw new IOException("No points loaded.");
		}
		return array('points' => $points);
	}
	
	public function createTrack(AppForm $form) {
		try {
			$data = $form->values;
			$file = $data['file'];
	
			if (!empty($file)) {
				if ($file->isOK()) {
					$this->getComponent('map')->setTrack($this->parseFile(file_get_contents($file)));
				} else {
					// for errors see http://cz2.php.net/manual/en/features.file-upload.errors.php
					$form->addError('Soubor se nepodařilo nahrát. <small>Error ' . $file->getError() . '</small>');
				}
			}
			
			// set name
			$this->template->name = $data['name'];
			$this->getComponent('map')->setName($data['name']);
			
			$this->setView('create');
		} catch (IOException $e) {
			$form->addError('Soubor se nepodařilo nahrát. <small>Error ' . $e->getMessage() . '</small>');
		}
	}

	public function renderUser($id) {
		$u = new Users;
		$user = $u->fetch($id);

		// exists?
		if (empty($user)) throw new BadRequestException('Item not found.');

		// template
		$this->template->permalink = $this->permalink();
		$this->template->user = $user;
		$this->template->title = $user['fullname'];

		// self edit
		//$this->flashMessage('Toto je tvůj vlastní profil. <a href="' . $this->link('Account:') . '">Chceš upravit jeho text? Změnit obrázek?</a>', 'tip');

		// rss
//		$this->template->feeds[] = array('title' => "Výkony ($user[fullname])", 'link' => $this->link('Xml:user', $user['id']));
//		$this->template->feeds[] = array('title' => "Komentáře ($user[fullname])", 'link' => $this->link('Xml:comments', $user['id']));
	}



	/********************* signals *********************/

	public function handleDelete($id) {
		try {
			$this->authenticate();
			$user = Environment::getUser()->getIdentity()->id;
				
			$u = new Users;
			if (!$u->hasTrack($user, $id)) {
				throw new InvalidStateException("Can't delete this track.");
			}
				
			$t = new Tracks;
			$completely = $t->delete($id, $user);
			if ($completely) {
				$this->flashMessage('Trasa byla smazána!');
				$this->redirect('Default:');
			}
			$this->flashMessage('Trasa byla odebrána z tvé sbírky.');
			$this->redirect('this');
		} catch (InvalidStateException $e) {
			$this->flashMessage('Vyskytla se chyba. <small>' . $e->getMessage() . '</small>', 'error');
		}
	}

	public function handleAdd($id) {
		try {
			$this->authenticate();
			$user = Environment::getUser()->getIdentity()->id;
				
			$u = new Users;
			if ($u->hasTrack($user, $id)) {
				throw new InvalidStateException("Can't add track which is already yours.");
			}
				
			$t = new Tracks;
			$t->add($id, $user);
			$this->flashMessage('Trasa byla přidána do tvé sbírky.');
			$this->redirect('Track:item', $id);
		} catch (InvalidStateException $e) {
			$this->flashMessage('Vyskytla se chyba. <small>' . $e->getMessage() . '</small>', 'error');
		}
	}

}
