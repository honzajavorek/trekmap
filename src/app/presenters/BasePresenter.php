<?php

/**
 * Base class for all application presenters.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
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
		
		// identity
		$user = Environment::getUser();
		if ($user->isAuthenticated()) {
			$this->template->identity = $user->getIdentity();	
		}
	}

	/**
	 * Creates link to GRAVATAR.
	 */
	function linkGravatar($size, $email = NULL, $isFemale = FALSE) {
		if (empty($email)) {
			return Environment::getVariable('baseUri') . 'img/somebody.png';
		}
		$default = Environment::getVariable('absoluteUri') . 'img/' . (($isFemale)? 'girl.png' : 'boy.png');
		return 'http://www.gravatar.com/avatar.php?gravatar_id='
		. md5(trim($email))
		. '&default='
		. urlencode($default)
		. '&size=' . (int)$size;
	}
	
}
