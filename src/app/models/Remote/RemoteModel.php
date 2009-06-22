<?php

/**
 * General remote file model.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
abstract class RemoteModel extends Object {

	protected $uri;

	public function __construct($uri) {
		$this->uri = $uri;
	}

	/**
	 * Checks whether target file exists.
	 *
	 * @return bool
	 */
	final public function exists() {
		if (stripos($this->uri, 'https://') !== FALSE) { // HTTPS

			
			return TRUE;

		} elseif (stripos($this->uri, 'http://') !== FALSE) { // HTTP URL

			$uri = str_replace('http://', '', $this->uri);
			if (strstr($uri, '/')) {
				$uri = explode('/', $uri, 2);
				$uri[1] = '/' . $uri[1];
			} else {
				$uri = array($uri, '/');
			}
			$fh = @fsockopen($uri[0], 80);
			if ($fh) {
				fputs($fh, 'GET ' . $uri[1] . " HTTP/1.1\nHost:" . $uri[0] . "\n\n");
				if (fread($fh, 22) == 'HTTP/1.1 404 Not Found') {
					return FALSE;
				}
				else {
					return TRUE;
				}
			} else {
				return FALSE;
			}

		} else {
			return FALSE;
		}
	}

	/**
	 * Returns MIME type of remote file and it's encoding charset.
	 *
	 * Inspired by http://nadeausoftware.com/articles/2007/06/php_tip_how_get_web_page_content_type.
	 *
	 * @return array First is MIME, second charset.
	 */
	final private function getContentType() {
		$fp = fopen($this->uri, 'r');
		$meta = stream_get_meta_data($fp);
		$meta = array_reverse($meta['wrapper_data']); // array reverse because we want the last Content-type
		foreach ($meta as $header) {
			$matches = array();
			preg_match('~content-type:\\s+([^;]+)(;\\s+charset=([a-z0-9_-]+))?~i', $header, $matches);
			if (!empty($matches)) {
				break;
			}
		}
		fclose($fp);

		return array($matches[1], (isset($matches[3]))? $matches[3] : FALSE);
	}

	/**
	 * Re-encodes content to UTF-8.
	 *
	 * @param $content
	 * @return string
	 */
	final private function reEncode($content) {
		list($mime, $encoding) = $this->getContentType($this->uri);
		if ($encoding) {
			$old = $encoding;
		} else { // we still don't know encoding
			$matches = array();
			if (strpos($mime, 'html') !== FALSE) { // it's html, let's find it in META tag
				preg_match('~charset=([^"\']+)["\']~i', $content, $matches);
				$old = trim($matches[1]);
			} elseif (strpos($mime, 'xml') !== FALSE) { // it's xml, let's find it in XML declaration
				preg_match('~encoding=["\']([^\'"]+)["\']~i', $content, $matches);
				$old = trim($matches[1]);
			} else { // let it be
				return $content;
			}
		}
		
		$old = strtoupper($old);
		if ($old == 'UTF-8') {
			return $content;
		}
		return iconv(strtoupper($old), 'UTF-8', $content);
	}

	/**
	 * Loads remote content, handles caching.
	 *
	 * @param $expires Expiration of cache in seconds. Defaults to 3 hours.
	 * @param $prefix Prefix for cache files.
	 * @param $key Key suffix for cache.
	 * @return string
	 */
	final protected function getRemoteContent($expires = 10800, $prefix = 'remote', $key = '') {
		$cache = new Cache(new FileStorage(Environment::getVariable('appDir') . "/temp/$prefix-"));
		$key = md5($this->uri . $key);

		if (isset($cache[$key])) {
			return $cache[$key];
		} else {
			try {
				$content = @file_get_contents($this->uri);
				if ($content === FALSE) {
					throw new IOException('Function file_get_contents failed.');
				}

				$content = $this->reEncode($content); // re-encode to UTF-8

				$cache["$key-bak"] = $content; // neverending backup cache
				if ($expires > 0) { // if cached
					$cache->save($key, $content, array(
						'expire' => time() + $expires
					));
				}
				return $content;
			} catch (IOException $e) {
				// problem has occured -> let's try the latest backup cache
				if (isset($cache["$key-bak"])) {
					return $cache["$key-bak"];
				} else {
					// no backup cache, nothing can save us
					throw $e;
				}
			}
		}
	}

	/**
	 * Provides PHP data structures parsed from downloaded content. 
	 * 
	 * @return mixed
	 */
	abstract public function getData();

}
