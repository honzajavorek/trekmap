<?php

/**
 * Base class for all application presenters.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
abstract class BasePresenter extends Presenter {

	protected function createTemplate() {
		$template = parent::createTemplate();
		$template->registerHelperLoader('ExtraTemplateHelpers::loader');
		$template->registerFilter('CurlyBracketsFilter::invoke');
		return $template;
	}
	
	protected function startup() {
		$this->template->language = 'cs';
		$this->template->copyright = '© ' . ((date('Y') == Environment::getVariable('since'))? date('Y') : Environment::getVariable('since') . '-' . date('Y'));
		
		$this->template->metaRobots = Environment::getVariable('robots');
		$this->template->metaDescription = ''; // TODO
		$this->template->metaKeywords = array(); // TODO
		
		$this->template->cssLayout = 'layout-basic';

		// absolute uri
		Environment::setVariable('absoluteUri', Environment::getHttpRequest()->uri->hostUri . Environment::getVariable('baseUri'));
		$this->template->absoluteUri = Environment::getVariable('absoluteUri');

		// stored request (for login, logout)
		$this->template->request = $this->getApplication()->storeRequest();
		
		// identity
		$user = Environment::getUser();
		if ($user->isAuthenticated()) {
			$this->template->identity = $user->getIdentity();	
		}
		
		// feeds
		$this->template->feeds = array();
		
		// scripts
		$this->template->js = array(
			'baseUri' => Environment::getVariable('baseUri'),
			'absoluteUri' => Environment::getVariable('absoluteUri'),
			'proxyUri' => $this->link(':Proxy:default'),
		);
		$this->template->scripts = array(
			'helpers',
		);
	}
	
	public function beforeRender() {
		// form errors into flash messages
		$forms = $this->getComponents(FALSE, 'AppForm');
		foreach ($forms as $form) {
			$errors = $form->getErrors();
			$errors = implode(' ', $errors);
			if (strlen($errors)) {
				$this->flashMessage($errors, 'error');
			}
		}
	}
	
	/**
	 * Authentication and basic authorization.
	 *
	 * @param bool $admin Whether common user can see the page or must have an admin flag.
	 */
	public function authenticate($onlyAdmin = FALSE) {
		// user authentication
		$user = Environment::getUser();
		$authorized = ($onlyAdmin)? $user->isInRole('admin') : TRUE;

		if (!$user->isAuthenticated() && $authorized) {
			if ($user->getSignOutReason() === User::INACTIVITY) {
				$this->flashMessage('Proběhlo odhlášení z důvodu nečinnosti.');
			}
			$this->redirect('Account:login', $this->backlink());
		}
	}
	
	public function permalink() {
		$this->absoluteUrls = TRUE;
		$link = $this->link($this->backlink(), $this->params);
		$this->absoluteUrls = FALSE;
		return $link;
	}
	
}
