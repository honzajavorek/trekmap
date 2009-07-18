<?php

/**
 * Track datagrid component.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class TracksDataGrid extends Control {
	
	private $tracks;
	public $count;
	
	public function __construct($tracks) {
		parent::__construct();
		$this->tracks = $tracks;
		$this->count = count($tracks);
	}

	/********************* render *********************/
	
	protected function createTemplate() {
		$template = parent::createTemplate();
		$template->registerHelperLoader('ExtraTemplateHelpers::loader');
		$template->registerFilter('CurlyBracketsFilter::invoke');
		$template->request = $this->presenter->getApplication()->storeRequest();
		return $template;
	}
	
	protected function renderTrack($track) {
		$template = $this->createTemplate();
		$template->setFile(dirname(__FILE__) . '/track.phtml');
		
		if (Environment::getUser()->isAuthenticated()) {
			$template->identity = Environment::getUser()->getIdentity();
			
			$u = new Users;
			$template->isMine = $u->hasTrack(Environment::getUser()->getIdentity()->id, $track['id']);
		} else {
			$template->isMine = FALSE;
		}
		
		$template->track = $track;
		$template->render();
	}
	
	protected function renderEmpty() {
		$template = $this->createTemplate();
		$template->setFile(dirname(__FILE__) . '/empty.phtml');
		$template->render();
	}
	
	public function render() {
		if ($this->count) {
			foreach ($this->tracks as $track) {
				$this->renderTrack($track);
			}
		} else { // empty datagrid
			$this->renderEmpty();
		}
	}
	
	/********************* signals *********************/
	
	public function handleDelete($id) {
		try {
			$this->presenter->authenticate();
			$user = Environment::getUser()->getIdentity()->id;
			
			$u = new Users;
			if (!$u->hasTrack($user, $id)) {
				throw new InvalidStateException("Can't delete this track.");
			}
			
			$t = new Tracks;
			$completely = $t->delete($id, $user);
			
			if ($completely) {
				$this->presenter->flashMessage('Trasa byla smazána!');
				$this->presenter->redirect('Default:');
			}
			$this->presenter->flashMessage('Trasa byla odebrána z tvé sbírky.');
			$this->presenter->redirect('this');
		} catch (InvalidStateException $e) {
			$this->presenter->flashMessage('Vyskytla se chyba. <small>' . $e->getMessage() . '</small>', 'error');
		}
	}
	
	public function handleAdd($id) {
		try {
			$this->presenter->authenticate();
			$user = Environment::getUser()->getIdentity()->id;
			
			$u = new Users;
			if ($u->hasTrack($user, $id)) {
				throw new InvalidStateException("Can't add track which is already yours.");
			}
			
			$t = new Tracks;
			$t->add($id, $user);
			$this->presenter->flashMessage('Trasa byla přidána do tvé sbírky.');
			$this->presenter->redirect('this');
		} catch (InvalidStateException $e) {
			$this->presenter->flashMessage('Vyskytla se chyba. <small>' . $e->getMessage() . '</small>', 'error');
		}
	}
	
}
