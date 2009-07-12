<?php

/**
 * Track presenter.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class TrackPresenter extends BasePresenter {

	/********************* view default *********************/

	public function renderDefault() {
		$this->template->title = 'Trasy';
	}
	
	/********************* view create *********************/
	
	public function renderCreate() {
		$identity = Environment::getUser()->getIdentity();
		$this->template->title = 'Přidat novou trasu';
		
		// map
		$map = new TrekMap(TrekMap::EDIT);
		$this->addComponent($map, 'map');
		$this->template->map = $map;
		
		// set place
		$place = (string)$identity->place;
		if (!empty($place)) {
			$map->setPlace($place);
		}
	}
	
	public function handleSave($points) {
		$this->payload->uri = NULL;
//		if (!empty($points)) {
//			$b = new Bookmarks;
//			$id = $b->insert((string)$points);
//			$this->payload->uri = $this->link($this->backlink(), $id);	
//		}
		$this->terminate();
	}
	
}
