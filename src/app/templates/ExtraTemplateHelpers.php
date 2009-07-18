<?php

/**
 * Standard template helpers shipped with Nette Framework.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
final class ExtraTemplateHelpers {

	/**
	 * Static class - cannot be instantiated.
	 */
	final public function __construct() {
		throw new LogicException("Cannot instantiate static class " . get_class($this));
	}
	
	/**
	 * Try to load the requested helper.
	 * @param  string  helper name
	 * @return callback
	 */
	public static function loader($helper) {
		$callback = 'ExtraTemplateHelpers::' . $helper;
		/**/fixCallback($callback);/**/
		if (is_callable($callback)) {
			return $callback;
		}
	}
	
	/**
	 * Is the current user admin?
	 *
	 * @return bool
	 */
	public static function isAdmin() {
		return Environment::getUser()->isInRole('admin');
	}
	
	/**
	 * Creates link to Google Static Map.
	 */
	public static function staticMap($width, $height, array $points = array()) {
	    $pts = array();
	    foreach ($points as $point) {
			$pts[] = $point['lat'] . ',' . $point['lng'];
		}
		$pts = implode('|', $pts);
		return "http://maps.google.com/staticmap" .
			"?size={$width}x{$height}" .
			"&path=rgba:0xED1C24FF,weight:3|$pts" .
			"&maptype=hybrid" .
			"&hl=cs" .
			"&sensor=false&key=" . Environment::getVariable('google');
	}
	
	/**
	 * Creates link to GRAVATAR.
	 */
	public static function gravatar($size, $email = NULL, $isFemale = NULL) {
		if ($email === NULL && $isFemale === NULL) { // guest
			return Environment::getVariable('baseUri') . "img/avatar-unknown$size.png";
		}
		$genderImg = (($isFemale)? "avatar-female$size.png" : "avatar-male$size.png");
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
	
	public static function bmi($weight, $height) {
		if (!$weight || !$height) {
			return '?';
		}
		$bmi = $weight / pow($height / 100, 2);
		if ($bmi < 16.5) {
			$res = 'těžká podvýživa';
		} elseif ($bmi >= 16.5 && $bmi < 18.5) {
			$res = 'podváha';
		} elseif ($bmi >= 18.5 && $bmi < 25) {
			$res = 'ideální váha';
		} elseif ($bmi >= 25 && $bmi < 30) {
			$res = 'nadváha';
		} elseif ($bmi >= 30 && $bmi < 35) {
			$res = 'mírná obezita';
		} elseif ($bmi >= 35 && $bmi < 40) {
			$res = 'střední obezita';
		} else {
			$res = 'morbidní obezita';
		}
		$bmi = round($bmi, 2);
		return "$bmi ($res)";
	}
	
	public static function km($meters) {
		return round($meters / 1000, 1) . ' km';
	}
	
	public static function round($n, $precision) {
		return round($n, $precision);
	}
	
	public static function dateAgoInWords($date) {
		if (!$date) {
            return FALSE;
        } elseif (is_numeric($date)) {
            $date = (int) $date;
        } elseif ($date instanceof DateTime) {
            $date = $date->format('U');
        } else {
            $date = strtotime($date);
        }

        $delta = time() - $date;

        if ($delta < 0) {
            $delta = round(abs($delta) / 60);
            if ($delta < 1440) return 'ještě dnes';
            if ($delta < 2880) return 'zítra';
            if ($delta < 43200) return 'za ' . round($delta / 1440) . ' ' . self::plural(round($delta / 1440), 'den', 'dny', 'dní');
            if ($delta < 86400) return 'za měsíc';
            if ($delta < 525960) return 'za ' . round($delta / 43200) . ' ' . self::plural(round($delta / 43200), 'měsíc', 'měsíce', 'měsíců');
            if ($delta < 1051920) return 'za rok';
            return 'za ' . round($delta / 525960) . ' ' . self::plural(round($delta / 525960), 'rok', 'roky', 'let');
        }

        $delta = round($delta / 60);
        if ($delta < 1440) return 'dnes';
        if ($delta < 2880) return 'včera';
        if ($delta < 43200) return 'před ' . round($delta / 1440) . ' dny';
        if ($delta < 86400) return 'před měsícem';
        if ($delta < 525960) return 'před ' . round($delta / 43200) . ' měsíci';
        if ($delta < 1051920) return 'před rokem';
        return 'před ' . round($delta / 525960) . ' lety';
	}
	
	public static function timeAgoInWords($time) {
        if (!$time) {
            return FALSE;
        } elseif (is_numeric($time)) {
            $time = (int) $time;
        } elseif ($time instanceof DateTime) {
            $time = $time->format('U');
        } else {
            $time = strtotime($time);
        }

        $delta = time() - $time;

        if ($delta < 0) {
            $delta = round(abs($delta) / 60);
            if ($delta == 0) return 'za okamžik';
            if ($delta == 1) return 'za minutu';
            if ($delta < 45) return 'za ' . $delta . ' ' . self::plural($delta, 'minuta', 'minuty', 'minut');
            if ($delta < 90) return 'za hodinu';
            if ($delta < 1440) return 'za ' . round($delta / 60) . ' ' . self::plural(round($delta / 60), 'hodina', 'hodiny', 'hodin');
            if ($delta < 2880) return 'zítra';
            if ($delta < 43200) return 'za ' . round($delta / 1440) . ' ' . self::plural(round($delta / 1440), 'den', 'dny', 'dní');
            if ($delta < 86400) return 'za měsíc';
            if ($delta < 525960) return 'za ' . round($delta / 43200) . ' ' . self::plural(round($delta / 43200), 'měsíc', 'měsíce', 'měsíců');
            if ($delta < 1051920) return 'za rok';
            return 'za ' . round($delta / 525960) . ' ' . self::plural(round($delta / 525960), 'rok', 'roky', 'let');
        }

        $delta = round($delta / 60);
        if ($delta == 0) return 'před okamžikem';
        if ($delta == 1) return 'před minutou';
        if ($delta < 45) return "před $delta minutami";
        if ($delta < 90) return 'před hodinou';
        if ($delta < 1440) return 'před ' . round($delta / 60) . ' hodinami';
        if ($delta < 2880) return 'včera';
        if ($delta < 43200) return 'před ' . round($delta / 1440) . ' dny';
        if ($delta < 86400) return 'před měsícem';
        if ($delta < 525960) return 'před ' . round($delta / 43200) . ' měsíci';
        if ($delta < 1051920) return 'před rokem';
        return 'před ' . round($delta / 525960) . ' lety';
	}
	
	public static function microformat($val, $type) {
		switch ($type) {
			case 'date':
				return date('Y-m-d', strtotime($val));
				break;
			default:
				throw new NotImplementedException('Not implemented.');
		}
	}
	
	/**
     * Plural: three forms, special cases for 1 and 2, 3, 4.
     * (Slavic family: Slovak, Czech)
     * 
     * @param  int
     * @return mixed
     */
    public static function plural($n) {
        $args = func_get_args();
        return $args[($n == 1) ? 1 : (($n >= 2 && $n <= 4) ? 2 : 3)];
    }
	
}
