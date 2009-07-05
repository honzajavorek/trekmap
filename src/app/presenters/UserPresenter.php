<?php

/**
 * User presenter.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class UserPresenter extends BasePresenter {

	/********************* view default *********************/

	public function renderDefault() {
		$this->template->title = 'Borci a borkyně';
		
		$u = new Users;
		$this->template->users = $u->getAll()->orderBy('id', 'DESC')->fetchAll();
	}
	
	/********************* view profile *********************/
	
	public function renderProfile($id) {
		$u = new Users;
		$row = $u->getAll()->where('id = %i', $id)->fetch();
		if (!$row) {
			throw new BadRequestException('User doesn\'t exist.');
		}
		
		// elements
		$title = ($row['female'])?  'Borkyně ' : 'Borec ';
		$this->template->title = $title . $row['fullname'];
		$this->template->t = $title;
		$this->template->fullname = $row['fullname'];
		
		$this->template->a = $a = ($row['female'])?  'a' : '';
		
		if (empty($row['description'])) {
			$this->template->bio = "<em>$row[fullname] svůj životní příběh nevyplnil$a.</em>";
		} else {
			$this->template->bio = $row['description'];
		}
		
		$this->template->url = $row['id'];
		$this->template->email = $row['email'];
		$this->template->female = $row['female'];
		
		// TODO
		
		// according to characters
//		$cloud = new CloudControl('Article:item');
//		$all = $u->getCharacters($row['id']);
//		foreach ($all as $item) {
//			$cloud->addItem($item['characters'], $item['url'], $item['title']);
//		}
//
//		$this->addComponent($cloud, 'cloudCharacters');
//		$this->template->characters = $cloud;
		
		// according to popularity
//		$cloud = new CloudControl('Article:item');
//		$all = $u->getPopularity($row['id']);
//		foreach ($all as $item) {
//			$cloud->addItem($item['views'], $item['url'], $item['title']);
//		}
//
//		$this->addComponent($cloud, 'cloudPopularity');
//		$this->template->popularity = $cloud;
		
		// last activity
//		$this->template->activity = $u->getActivity($row['id'])
//			->orderBy('date', dibi::DESC)
//			->applyLimit(10)
//			->fetchAll();
	}
	
}
