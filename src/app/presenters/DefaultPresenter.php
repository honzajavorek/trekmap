<?php

/**
 * Default presenter.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class DefaultPresenter extends BasePresenter {

	/********************* view default *********************/
	
	public function actionDefault() {
		if (Environment::getUser()->isAuthenticated()) {
			$this->redirect('Track:user', Environment::getUser()->getIdentity()->id);
		}
	}
	
	public function renderDefault() {
		$this->template->title = 'Ahoj!';
		$this->template->cssLayout .= ' layout-homepage';
		
		$u = new Users;
		$u = $u->fetchAll();
		$this->template->profile = (int)$u[rand(0, count($u) - 1)]['id'];
	}
	
	/********************* view users *********************/
	
	public function renderUsers() {
		$this->template->title = 'Všichni zdejší borci';
		
		$u = new Users;
		$this->template->users = $u->fetchAll();
	}
	
	/********************* view demo *********************/
	
	public function renderDemo($id = NULL) {
		$this->template->title = 'Demo';
		$this->template->cssLayout = 'layout-wide layout-map';
		
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
			
			$this->flashMessage("Adresa této trasy je <strong><a href=\"$link\">$link</a></strong>. Odkaz je platný měsíc.", 'permanent');
			
			$this->template->title .= " [ $id ]";
		} else {
			$map = new TrekMap(TrekMap::DEMO);
			
			if (Environment::getUser()->isAuthenticated()) {
				$place = Environment::getUser()->getIdentity()->place;
				if (!empty($place)) {
					$map->setPlace($place);
				}
			}
			
			$this->flashMessage('
				Zde si můžeš vyzkoušet mapu.
				Můžeš ji dokonce jednorázově <strong>uložit a získat na ni odkaz</strong> (bude fungovat i nezaregistrovaným).
			', 'tip');
		}
		
		$this->addComponent($map, 'map');
		$this->template->map = $map;
	}
	
	public function handleSave($track, $desc) {
		$this->payload->uri = NULL;
		if (!empty($track)) {
			$b = new Bookmarks;
			$id = $b->insert((string)$track);
			$this->payload->uri = $this->link($this->backlink(), $id);	
		}
		$this->terminate();
	}
	
	/********************* view help *********************/
	
	public function renderHelp() {
		$this->template->title = 'Nápověda';
	}
	
	/********************* view info *********************/
	
	public function renderInfo() {
		$this->template->title = 'O TrekMap';
		
		$u = new Users;
		$admin = $u->fetchAdmin();
		$this->template->littlemaple = $admin['id'];
		
		
	}

}
