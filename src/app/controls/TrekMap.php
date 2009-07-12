<?php

/**
 * Map component.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class TrekMap extends Control {
	
	const DEMO = 'demo';
	const VIEW = 'view';
	const EDIT = 'edit';
	
	private $presenter = NULL;
	private $input = array();
	
	private $mode;
	
	public function __construct($mode) {
		parent::__construct();
		$this->mode = $mode;
		$this->monitor('Presenter');
	}
	
	protected function bindInput() {
		if (!$this->presenter) return;
		foreach ($this->input as $index => $value) {
			$this->presenter->template->js[$index] = $value;
		}
	}
	
	protected function attached($presenter) {
		$presenter->template->scripts[] = 'trekmap'; // turn on the map scripts
		$this->presenter = $presenter;
		
		$this->input['saveUri'] = $this->presenter->link('save!'); // link to presenter signal
		$this->input['vyskopis'] = Environment::getVariable('vyskopis'); // API key for vyskopis
		$this->bindInput();
	}
	
	public function setPlace($place) {
		$this->input['place'] = $place;
		$this->bindInput();
	}
	
	public function setTrack($track) {
		$this->input['track'] = $track;
		$this->bindInput();
	}
	
	public function render() {
		$template = $this->createTemplate();
		$template->registerFilter('CurlyBracketsFilter::invoke');
		
		$template->mode = $this->mode;
		
		$template->setFile(dirname(__FILE__) . '/trekmap.phtml');
		$template->render();
	}
	
}
