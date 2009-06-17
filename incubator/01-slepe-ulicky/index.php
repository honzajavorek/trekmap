<?php
$switch = '<p><a href="?map=google">Google</a> | <a href="?map=seznam">Seznam</a> | <a href="?map=atlas">Atlas</a></p>';
if (!isset($_GET['map'])) exit($switch);
define('MAP_PROVIDER', $_GET['map']); // google, seznam, atlas
// pozdeji lepe pripravit, udelat jako objektikove konstanty i s temi API klici apod.
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">
<html dir="ltr" lang="cs">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<meta http-equiv="imagetoolbar" content="no">

	<script type="text/javascript" charset="utf-8" src="http://www.google.com/jsapi<?php if (MAP_PROVIDER == 'google') { ?>?key=ABQIAAAAcI_qVFfqvblpC512MA5R6xRyI3AnVjWQTv2ClwCQpQBQc6gtGBQlMH5qAiweKY7AFWU3nK_2VRYQCg&amp;hl=cs&amp;sensor=false<?php } ?>"></script>
	<script type="text/javascript">google.load('jquery', '1');</script>

	<?php if (MAP_PROVIDER == 'google') { ?>
		<script type="text/javascript">google.load('maps', '2');</script>
	<?php } ?>
	<?php if (MAP_PROVIDER == 'seznam') { ?>
		<script type="text/javascript" charset="utf-8" src="http://api.mapy.sbeta.cz/js/jak+smap.js"></script>
		<script type="text/javascript" charset="utf-8" src="http://api.mapy.sbeta.cz/js/config.js"></script>
	<?php } ?>
	<?php if (MAP_PROVIDER == 'atlas') { ?>
		<script type="text/javascript" charset="utf-8" src="http://amapy.atlas.cz/api/api.ashx?guid=b49fd904-d0d9-46b8-a7c4-8a59e6fc238f"></script>
	<?php } ?>

	<script type="text/javascript" charset="utf-8" src="./js/trekmap.js"></script>
	<script type="text/javascript">
	    TrekMap('map', '<?php echo MAP_PROVIDER ?>');
	</script>

	<style>
	    #map {
			width: 100%;
			height: 500px;
		}
	</style>

	<title>Map Core Incubator</title>

</head>
<body>

<?php echo $switch; ?>

<div id="map"><noscript><p>JavaScript turned off.</p></noscript></div>

<div id="debug"></div>

</body>
</html>
