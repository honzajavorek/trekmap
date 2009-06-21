<?php

/**
 * Error presenter.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 */
class ErrorPresenter extends BasePresenter {

	public function renderDefault($exception) {
		if ($this->isAjax()) {
			$this->getPayload()->events[] = array('error', $exception->getMessage());
			$this->terminate();
		} else {
			$this->template->email = Environment::getVariable('email');
			$this->template->robots = 'noindex,noarchive';

			if ($exception instanceof BadRequestException) {
				Environment::getHttpResponse()->setCode($exception->getCode());
				$this->template->title = 'Chybièka se vloudila (404 Not Found)';
				$this->setView('404');

			} else {
				Environment::getHttpResponse()->setCode(500);
				$this->template->title = 'Ajajaj… (500 Internal Server Error)';
				$this->setView('500');

				Debug::processException($exception);
			}
		}
	}

}
