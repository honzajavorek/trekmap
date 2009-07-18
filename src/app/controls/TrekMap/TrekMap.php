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
	
	protected $input = array();
	protected $mode;
	
	public function __construct($mode) {
		parent::__construct();
		$this->mode = $mode;
		$this->monitor('Presenter');
	}
	
	protected function bindInput() {
		try {
			foreach ($this->input as $index => $value) {
				$this->presenter->template->js[$index] = $value;
			}
		} catch (InvalidStateException $e) {
			return;
		}
	}
	
	protected function attached($presenter) {
		$presenter->template->scripts[] = 'trekmap'; // turn on the map scripts
		$this->input['saveUri'] = $presenter->link('save!'); // link to presenter signal
		$this->input['vyskopis'] = Environment::getVariable('vyskopis'); // API key for vyskopis
		$this->input['mode'] = $this->mode; // map mode
		$this->bindInput();
	}
	
	public function setPlace($place) {
		$this->input['place'] = $place;
		$this->bindInput();
	}
	
	public function setName($name) {
		$this->input['name'] = $name;
		$this->bindInput();
	}
	
	public function setTrack($track) {
		if (!is_string($track)) {
			$track = json_encode($track);
		}
		$this->input['track'] = $track;
		$this->bindInput();
	}
	
	protected function createTemplate() {
		$template = parent::createTemplate();
		$template->registerFilter('CurlyBracketsFilter::invoke');
		return $template;
	}
	
	protected function renderControls() {
		$template = $this->createTemplate();
		$template->setFile(dirname(__FILE__) . '/controls.phtml');
		$template->mode = $this->mode;
		$template->render();
	}
	
	protected function renderMap() {
		$template = $this->createTemplate();
		$template->setFile(dirname(__FILE__) . '/map.phtml');
		$template->mode = $this->mode;
		$template->render();
	}
	
	public function render($item) {
		$item = ucfirst($item);
		if (is_callable(array($this, $item))) {
			return $this->{"render$item"}();
		} else {
			throw new NotImplementedException("Method TrekMap::render$item() doesn't exist.");
		}
	}
	
}
