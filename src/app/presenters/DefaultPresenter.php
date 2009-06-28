<?php

/**
 * Default presenter.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class DefaultPresenter extends BasePresenter {

	public function renderDefault() {
		$this->template->title = 'Ahoj';
		// TODO
	}
	
	public function renderDemo($id = NULL) {
		$this->template->title = 'Demo';
		$this->template->scripts[] = 'trekmap'; // turn on the map scripts
		$this->template->js['saveUri'] = $this->link('save!'); // link to signal
		
		if ($id) { // autoload
			// load from database
			$b = new Bookmarks;
			$track = $b->fetch($id);
			$this->template->js['autoload'] = $track; // track from db
			
			// link
			$this->absoluteUrls = TRUE;
			$link = $this->link($this->backlink(), $id);
			$this->absoluteUrls = FALSE;
			
			$this->template->flashes[] = (object)array(
				'type' => 'info',
				'message' => "Adresa této trasy je <strong><a href=\"$link\">$link</a></strong>. Odkaz je platný měsíc.",
			);
		}
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
