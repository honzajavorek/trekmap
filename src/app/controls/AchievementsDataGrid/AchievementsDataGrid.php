<?php

/**
 * Achievements datagrid component.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class AchievementsDataGrid extends Control {
	
	private $achievements;
	public $count;
	
	public function __construct($achievements) {
		parent::__construct();
		$this->achievements = $achievements;
		$this->count = count($achievements);
	}

	/********************* render *********************/
	
	protected function createTemplate() {
		$template = parent::createTemplate();
		$template->registerHelperLoader('ExtraTemplateHelpers::loader');
		$template->registerFilter('CurlyBracketsFilter::invoke');
		$template->request = $this->presenter->getApplication()->storeRequest();
		return $template;
	}
	
	public function isMine($userid) {
		if (Environment::getUser()->isAuthenticated()) {
			return Environment::getUser()->getIdentity()->id == $userid;
		}
		return FALSE;
	}
	
	public function render() {
		$template = $this->createTemplate();
		$template->achievements = $this->achievements;
		$template->setFile(dirname(__FILE__) . '/grid.phtml');
		$template->render();
	}
	
	/********************* signals *********************/
	
	public function handleDelete($id) {
		try {
			$this->presenter->authenticate();
			$user = Environment::getUser()->getIdentity()->id;
			
			$u = new Users;
			if (!$u->hasAchievement($user, $id)) {
				throw new InvalidStateException("Can't delete this achievement.");
			}
			
			$a = new Achievements;
			$a->delete($id);
			
			$this->presenter->flashMessage('Výkon byl v pořádku smazán.');
			$this->presenter->redirect('this');
		} catch (InvalidStateException $e) {
			$this->presenter->flashMessage('Vyskytla se chyba. <small>' . $e->getMessage() . '</small>', 'error');
		}
	}
	
}
