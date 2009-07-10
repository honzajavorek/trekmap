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
		$template->registerFilter('CurlyBracketsFilter::invoke');
		
		return $template;
	}
	
	protected function startup() {
		$this->template->language = 'cs';
		$this->template->robots = Environment::getVariable('robots');
		$this->template->description = ''; // TODO
		$this->template->keywords = array(); // TODO
		$this->template->copyright = '© ' . ((date('Y') == Environment::getVariable('since'))? date('Y') : Environment::getVariable('since') . '-' . date('Y'));

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
		
		// scripts
		$this->template->js = array(
			'baseUri' => Environment::getVariable('baseUri'),
			'absoluteUri' => Environment::getVariable('absoluteUri'),
			'vyskopis' => Environment::getVariable('vyskopis'),
			'proxyUri' => $this->link(':Proxy:default'),
		);
		$this->template->scripts = array();
	}

	/********************* helpers *********************/
	
	/**
	 * Authentication and basic authorization.
	 *
	 * @param bool $admin Whether common user can see the page or must have an admin flag.
	 */
	protected function authenticate($onlyAdmin = FALSE) {
		// user authentication
		$user = Environment::getUser();
		$authorized = ($onlyAdmin)? $user->isInRole('admin') : TRUE;

		if (!$user->isAuthenticated() && $authorized) {
			if ($user->getSignOutReason() === User::INACTIVITY) {
				$this->flashMessage('Odhlásili jsme tě, protože jsi se nehýbal/a moc dlouho.');
			}
			$this->redirect('Account:login', $this->backlink());
		}
	}
	
	/**
	 * Is the current user admin?
	 *
	 * @return bool
	 */
	public function isAdmin() {
		$user = Environment::getUser();
		return $user->isInRole('admin');
	}
	
	
	/**
	 * Creates link to GRAVATAR.
	 */
	function linkGravatar($size, $email = NULL, $isFemale = NULL) {
		if ($email === NULL && $isFemale === NULL) { // guest
			return Environment::getVariable('baseUri') . "img/user-somebody$size.png";
		}
		$genderImg = (($isFemale)? "user-girl$size.png" : "user-boy$size.png");
		if ($email === NULL) { // unknown e-mail
			return Environment::getVariable('baseUri') . 'img/' . $genderImg;
		}
		$default = Environment::getVariable('absoluteUri') . 'img/' . $genderImg;
		return 'http://www.gravatar.com/avatar.php?gravatar_id='
		. md5(trim($email))
		. '&default='
		. urlencode($default)
		. '&size=' . (int)$size;
	}
	
}
