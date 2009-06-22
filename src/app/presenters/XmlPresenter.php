<?php

/**
 * XML channel presenter.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class XmlPresenter extends BasePresenter {

	protected function startup() {
		Debug::disableProfiler(); // disables profiler
		
		$this->setLayout(FALSE); // disables layout
		$this->absoluteUrls = TRUE; // switching to absolute URLs
	}

}
