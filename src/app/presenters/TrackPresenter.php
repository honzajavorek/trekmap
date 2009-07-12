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
		
		// TODO
//		$cloud = new CloudControl('User:profile');
//		
//		$u = new Users;
//		$result = $u->getAll()->select(array('characters', 'id', 'fullname'));
//		
//		$all = $result->fetchAll();
//		foreach ($all as $item) {
//			$cloud->addItem($item['characters'], $item['id'], $item['fullname']);
//		}
//
//		$this->addComponent($cloud, 'cloud');
//		$this->template->cloud = $cloud;
	}
	
	/********************* view create *********************/
	
	public function renderCreate() {
		$identity = Environment::getUser()->getIdentity();
		
		$this->template->title = 'Přidat novou trasu';
		$this->template->scripts[] = 'trekmap'; // turn on the map scripts
		$this->template->js['saveUri'] = $this->link('save!'); // link to signal
		
		// set place
		$place = (string)$identity->place;
		if (!empty($place)) {
			$this->template->js['place'] = $place;
		}
	}
	
	public function handleSave($points) {
//		$this->payload->uri = FALSE;
//		if (!empty($points)) {
//			$b = new Bookmarks;
//			$id = $b->insert((string)$points);
//			$this->payload->uri = $this->link($this->backlink(), $id);	
//		}
//		$this->terminate();
	}
	
}