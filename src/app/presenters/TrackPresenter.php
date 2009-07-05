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
	
}
