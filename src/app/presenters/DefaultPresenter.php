<?php

/**
 * Default presenter.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class DefaultPresenter extends BasePresenter {

	public function actionDefault() {
	    $user = Environment::getUser();
		if ($user->isAuthenticated()) {
			$this->setView('dashboard');
		}
	}

	public function renderDefault() {
		$this->template->title = 'Ahoj!';
		// TODO
	}
	
	public function renderDashboard() {
	    $this->template->title = 'Ahoj!';
		// TODO
	}
	
	public function renderDemo($id = NULL) {
		$this->template->title = 'Demo';
		
		// map
		if ($id) { // saved track
			$map = new TrekMap(TrekMap::VIEW);
			
			// load from database
			$b = new Bookmarks;
			$track = $b->fetch($id);
			$map->setTrack($track); // track from db
			
			// link
			$this->absoluteUrls = TRUE;
			$link = $this->link($this->backlink(), $id);
			$this->absoluteUrls = FALSE;
			
			$this->template->flashes[] = (object)array(
				'type' => 'permanent',
				'message' => "Adresa této trasy je <strong><a href=\"$link\">$link</a></strong>. Odkaz je platný měsíc.",
			);
			
			$this->template->title .= " [ $id ]";
		} else {
			$map = new TrekMap(TrekMap::DEMO);
			
			if (Environment::getUser()->isAuthenticated()) {
				$place = Environment::getUser()->getIdentity()->place;
				if (!empty($place)) {
					$map->setPlace($place);
				}
			}
		}
		
		$this->addComponent($map, 'map');
		$this->template->map = $map;
	}
	
	public function handleSave($points) {
		$this->payload->uri = FALSE;
		if (!empty($points)) {
			$b = new Bookmarks;
			$id = $b->insert((string)$points);
			$this->payload->uri = $this->link($this->backlink(), $id);	
		}
		$this->terminate();
	}
	
	public function renderHelp() {
		$this->template->title = 'Nápověda';
	}
	
	public function renderInfo() {
		$this->template->title = 'Info';
		// TODO
	}

}
