<?php

/**
 * AJAX proxy presenter.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class ProxyPresenter extends BasePresenter {

	protected function startup() {
		Debug::disableProfiler(); // disables profiler
		
		$this->setLayout(FALSE); // disables layout
		$this->absoluteUrls = TRUE; // switching to absolute URLs
	}
	
	public function renderDefault($uri) {
		$contents = trim(@file_get_contents($uri));
		if (empty($contents)) {
			$this->terminate();
		}
		$response = json_decode($contents, TRUE);
		if (is_array($response)) {
			foreach ($response as $item => $value) {
				$this->payload->{$item} = $value;
			}
		} else {
			$xml = simplexml_load_string($response);
			if ($xml == FALSE) { // text
				$this->payload->response = $response;
			} else { // converts xml to json
				$response = json_decode(json_encode($xml));
				foreach ($response as $item => $value) {
					$this->payload->{$item} = $value;
				}
			}
		}
		$this->terminate();
	}

}
