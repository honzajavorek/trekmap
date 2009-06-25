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
	
	public function renderDemo() {
		$this->template->title = 'Demo';
		
		// turn on the map scripts
		$this->template->scripts[] = 'trekmap';
		// TODO
	}
	
	public function renderHelp() {
		$this->template->title = 'Nápověda';
	}
	
	public function renderInfo() {
		$this->template->title = 'Info';
		// TODO
	}

}
