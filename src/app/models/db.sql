-- phpMyAdmin SQL Dump
-- version 2.10.1
-- http://www.phpmyadmin.net
--
-- Počítač: localhost
-- Vygenerováno: Sobota 18. července 2009, 04:15
-- Verze MySQL: 5.0.45
-- Verze PHP: 5.2.5

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Databáze: `trekmap`
--

-- --------------------------------------------------------

--
-- Struktura tabulky `achievements`
--

CREATE TABLE `achievements` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `user` int(10) unsigned NOT NULL,
  `track` int(10) unsigned NOT NULL,
  `activity` varchar(200) collate utf8_czech_ci NOT NULL,
  `time` time NOT NULL,
  `laps` tinyint(3) unsigned NOT NULL default '0',
  `achieved` date NOT NULL,
  `altitude` int(10) unsigned NOT NULL COMMENT 'difference in altitude, meters',
  `distance` float unsigned NOT NULL COMMENT 'total, meters',
  `speed` float unsigned NOT NULL,
  `pace` float unsigned NOT NULL,
  `energy` float unsigned default NULL COMMENT 'kJ',
  PRIMARY KEY  (`id`),
  KEY `user` (`user`),
  KEY `track` (`track`),
  KEY `activity` (`activity`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci AUTO_INCREMENT=9 ;

--
-- Vypisuji data pro tabulku `achievements`
--

INSERT INTO `achievements` (`id`, `user`, `track`, `activity`, `time`, `laps`, `achieved`, `altitude`, `distance`, `speed`, `pace`, `energy`) VALUES
(1, 3, 41, 'Lyžařský sjezd', '838:59:59', 1, '0000-00-00', 255, 10, 4.71902, 12.7145, NULL),
(2, 3, 41, 'Běh', '01:00:00', 1, '2009-07-17', 255, 10, 9.674, 6.20219, NULL),
(3, 3, 41, 'Běh', '01:00:00', 2, '2009-07-17', 510, 19, 19.348, 3.1011, 3168),
(4, 3, 41, 'Běh', '02:00:00', 2, '2009-07-17', 510, 19.348, 9.674, 6.20219, 4864.2),
(5, 4, 41, 'Cyklistika', '00:30:00', 1, '2009-07-15', 255, 9.674, 19.348, 3.1011, NULL),
(8, 4, 41, 'Cyklistika', '02:00:00', 1, '2009-07-17', 255, 9.674, 4.837, 12.4044, 1281.6);

-- --------------------------------------------------------

--
-- Struktura tabulky `activities`
--

CREATE TABLE `activities` (
  `id` tinyint(4) unsigned NOT NULL auto_increment,
  `name` varchar(200) collate utf8_czech_ci NOT NULL,
  `ratio` double unsigned NOT NULL COMMENT 'kJ per kg*min',
  `terrain` enum('easy','medium','hard') collate utf8_czech_ci default NULL,
  `speed` tinyint(4) default NULL COMMENT 'kmph',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci AUTO_INCREMENT=60 ;

--
-- Vypisuji data pro tabulku `activities`
--

INSERT INTO `activities` (`id`, `name`, `ratio`, `terrain`, `speed`) VALUES
(1, 'Cyklistika', 0.178, NULL, 8),
(2, 'Cyklistika', 0.217, NULL, 10),
(3, 'Cyklistika', 0.293, NULL, 13),
(4, 'Cyklistika', 0.334, NULL, 16),
(5, 'Cyklistika', 0.397, NULL, 17),
(6, 'Cyklistika', 0.523, NULL, 19),
(7, 'Cyklistika', 0.585, NULL, 21),
(8, 'Cyklistika', 1.705, NULL, 30),
(9, 'Horská turistika', 0.62, NULL, NULL),
(10, 'Lyžařský sjezd', 0.435, 'easy', NULL),
(11, 'Lyžařský sjezd', 0.51, 'medium', NULL),
(12, 'Lyžařský sjezd', 0.995, 'hard', NULL),
(13, 'Kanoistika', 0.285, NULL, NULL),
(14, 'Jízda na motocyklu', 0.579, NULL, NULL),
(15, 'Horolezectví', 0.527, NULL, NULL),
(16, 'Jízda na koni', 0.175, NULL, 7),
(17, 'Jízda na koni', 0.268, NULL, 15),
(18, 'Jízda na koni', 0.535, NULL, 25),
(19, 'Bruslení', 0.385, NULL, NULL),
(20, 'Běžky', 0.475, NULL, 15),
(21, 'Běžky', 0.654, NULL, 25),
(22, 'Běžky', 1.275, NULL, 35),
(23, 'Chůze', 0.123, 'easy', 2),
(24, 'Chůze', 0.131, 'medium', 2),
(25, 'Chůze', 0.14, 'hard', 2),
(26, 'Chůze', 0.165, 'easy', 3),
(27, 'Chůze', 0.178, 'medium', 3),
(28, 'Chůze', 0.195, 'hard', 3),
(29, 'Chůze', 0.223, 'easy', 4),
(30, 'Chůze', 0.242, 'medium', 4),
(31, 'Chůze', 0.266, 'hard', 4),
(32, 'Chůze', 0.3, 'easy', 5),
(33, 'Chůze', 0.322, 'medium', 5),
(34, 'Chůze', 0.353, 'hard', 5),
(35, 'Chůze', 0.387, 'easy', 6),
(36, 'Chůze', 0.419, 'medium', 6),
(37, 'Chůze', 0.456, 'hard', 6),
(38, 'Chůze', 0.487, 'easy', 7),
(39, 'Chůze', 0.505, 'medium', 7),
(40, 'Chůze', 0.62, 'hard', 7),
(41, 'Běh', 0.576, 'easy', 8),
(42, 'Běh', 0.595, 'medium', 8),
(43, 'Běh', 0.616, 'hard', 8),
(44, 'Běh', 0.655, 'easy', 9),
(45, 'Běh', 0.672, 'medium', 9),
(46, 'Běh', 0.693, 'hard', 9),
(47, 'Běh', 0.728, 'easy', 10),
(48, 'Běh', 0.737, 'medium', 10),
(49, 'Běh', 0.749, 'hard', 10),
(50, 'Běh', 0.805, 'easy', 11),
(51, 'Běh', 0.814, 'medium', 11),
(52, 'Běh', 0.826, 'hard', 11),
(53, 'Běh', 0.883, 'easy', 12),
(54, 'Běh', 0.891, 'medium', 12),
(55, 'Běh', 0.96, NULL, 13),
(56, 'Běh', 0.96, NULL, 13),
(57, 'Běh', 1.037, 'easy', 14),
(58, 'Běh', 1.114, 'easy', 15),
(59, 'Závodní maratón', 1.306, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `bookmarks`
--

CREATE TABLE `bookmarks` (
  `id` varchar(12) collate utf8_czech_ci NOT NULL,
  `track` text collate utf8_czech_ci NOT NULL,
  `saved` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;

--
-- Vypisuji data pro tabulku `bookmarks`
--

INSERT INTO `bookmarks` (`id`, `track`, `saved`) VALUES
('4a45dd3790f2', '[{"coords":{"x":3370841,"y":5491762},"altitude":399},{"coords":{"x":3381081,"y":5568562},"altitude":407}]', '2009-06-27 10:49:59'),
('4a45ddb5823a', '[{"coords":{"x":3365209,"y":5492274},"altitude":471},{"coords":{"x":3491673,"y":5530162},"altitude":438}]', '2009-06-27 10:52:05'),
('4a45e80deaa3', '[{"coords":{"x":3370841,"y":5491762},"altitude":399},{"coords":{"x":3381081,"y":5568562},"altitude":407},{"coords":{"x":3456857,"y":5530674},"altitude":223}]', '2009-06-27 11:36:13'),
('4a45e8b91326', '[{"coords":{"x":3370841,"y":5491762},"altitude":399},{"coords":{"x":3381081,"y":5568562},"altitude":407},{"coords":{"x":3438425,"y":5519922},"altitude":470},{"coords":{"x":3540825,"y":5552690},"altitude":253},{"coords":{"x":3552089,"y":5495858},"altitude":493},{"coords":{"x":3469145,"y":5477426},"altitude":474},{"coords":{"x":3414873,"y":5503538},"altitude":864},{"coords":{"x":3388761,"y":5470770},"altitude":597},{"coords":{"x":3370841,"y":5491762},"altitude":399}]', '2009-06-27 11:39:05'),
('4a45ea18267e', '[{"coords":{"x":3458905,"y":5551666},"altitude":197},{"coords":{"x":3618649,"y":5453874},"altitude":211},{"coords":{"x":3662681,"y":5498418},"altitude":223},{"coords":{"x":3736921,"y":5525042},"altitude":212},{"coords":{"x":3458905,"y":5551666},"altitude":197}]', '2009-06-27 11:44:56'),
('4a45ec9a2ae1', '[{"coords":{"x":3415897,"y":5529650},"altitude":540},{"coords":{"x":3530585,"y":5564978},"altitude":232},{"coords":{"x":3556697,"y":5501490},"altitude":567},{"coords":{"x":3493209,"y":5473330},"altitude":598},{"coords":{"x":3439449,"y":5497906},"altitude":416},{"coords":{"x":3415897,"y":5529650},"altitude":540}]', '2009-06-27 11:55:38'),
('4a4796e9b226', '[{"coords":{"x":3389273,"y":5475378},"altitude":526},{"coords":{"x":3495769,"y":5535282},"altitude":419}]', '2009-06-28 18:14:33'),
('4a50b099a556', '[{"coords":{"x":3405657,"y":5508658},"altitude":500},{"coords":{"x":3498841,"y":5502514},"altitude":503}]', '2009-07-05 15:54:33'),
('4a50b29e37e8', '[{"coords":{"x":3405657,"y":5508658},"altitude":500},{"coords":{"x":3498841,"y":5502514},"altitude":503},{"coords":{"x":3552089,"y":5514802},"altitude":485},{"coords":{"x":3568473,"y":5553202},"altitude":247},{"coords":{"x":3489625,"y":5548082},"altitude":223},{"coords":{"x":3393881,"y":5520946},"altitude":337},{"coords":{"x":3405657,"y":5508658},"altitude":500}]', '2009-07-05 16:03:10'),
('4a50dc74aeee', '[{"coords":{"x":3443289,"y":5529138},"altitude":354},{"coords":{"x":3583065,"y":5537330},"altitude":263},{"coords":{"x":3584089,"y":5492786},"altitude":671},{"coords":{"x":3511897,"y":5514802},"altitude":467},{"coords":{"x":3498585,"y":5504562},"altitude":477},{"coords":{"x":3483737,"y":5508658},"altitude":553},{"coords":{"x":3465817,"y":5496370},"altitude":409},{"coords":{"x":3451993,"y":5512242},"altitude":373},{"coords":{"x":3441241,"y":5500466},"altitude":502},{"coords":{"x":3424345,"y":5529138},"altitude":325},{"coords":{"x":3443289,"y":5529138},"altitude":354}]', '2009-07-05 19:01:40'),
('4a50ee6ddcd2', '[{"coords":{"x":3442265,"y":5534770},"altitude":361},{"coords":{"x":3509849,"y":5562930},"altitude":192},{"coords":{"x":3520089,"y":5551666},"altitude":214},{"coords":{"x":3505753,"y":5537842},"altitude":330},{"coords":{"x":3493465,"y":5531186},"altitude":321},{"coords":{"x":3515993,"y":5503538},"altitude":381},{"coords":{"x":3546201,"y":5508146},"altitude":563},{"coords":{"x":3581529,"y":5518386},"altitude":598},{"coords":{"x":3606105,"y":5518386},"altitude":451},{"coords":{"x":3610201,"y":5491250},"altitude":434},{"coords":{"x":3594329,"y":5482546},"altitude":558},{"coords":{"x":3576409,"y":5475378},"altitude":563},{"coords":{"x":3559513,"y":5472306},"altitude":625},{"coords":{"x":3542105,"y":5464626},"altitude":552},{"coords":{"x":3520089,"y":5471282},"altitude":641},{"coords":{"x":3493465,"y":5474354},"altitude":575},{"coords":{"x":3477593,"y":5465650},"altitude":427},{"coords":{"x":3467353,"y":5478962},"altitude":488},{"coords":{"x":3470937,"y":5491762},"altitude":541},{"coords":{"x":3471449,"y":5508658},"altitude":396},{"coords":{"x":3470937,"y":5491762},"altitude":541},{"coords":{"x":3467353,"y":5478962},"altitude":488},{"coords":{"x":3477593,"y":5465650},"altitude":427},{"coords":{"x":3493465,"y":5474354},"altitude":575},{"coords":{"x":3520089,"y":5471282},"altitude":641},{"coords":{"x":3542105,"y":5464626},"altitude":552},{"coords":{"x":3559513,"y":5472306},"altitude":625},{"coords":{"x":3576409,"y":5475378},"altitude":563},{"coords":{"x":3594329,"y":5482546},"altitude":558},{"coords":{"x":3610201,"y":5491250},"altitude":434},{"coords":{"x":3606105,"y":5518386},"altitude":451},{"coords":{"x":3581529,"y":5518386},"altitude":598},{"coords":{"x":3546201,"y":5508146},"altitude":563},{"coords":{"x":3515993,"y":5503538},"altitude":381},{"coords":{"x":3493465,"y":5531186},"altitude":321},{"coords":{"x":3505753,"y":5537842},"altitude":330},{"coords":{"x":3520089,"y":5551666},"altitude":214},{"coords":{"x":3509849,"y":5562930},"altitude":192},{"coords":{"x":3520089,"y":5551666},"altitude":214},{"coords":{"x":3505753,"y":5537842},"altitude":330},{"coords":{"x":3493465,"y":5531186},"altitude":321},{"coords":{"x":3515993,"y":5503538},"altitude":381},{"coords":{"x":3546201,"y":5508146},"altitude":563},{"coords":{"x":3581529,"y":5518386},"altitude":598},{"coords":{"x":3606105,"y":5518386},"altitude":451},{"coords":{"x":3610201,"y":5491250},"altitude":434},{"coords":{"x":3594329,"y":5482546},"altitude":558},{"coords":{"x":3576409,"y":5475378},"altitude":563},{"coords":{"x":3559513,"y":5472306},"altitude":625},{"coords":{"x":3542105,"y":5464626},"altitude":552},{"coords":{"x":3520089,"y":5471282},"altitude":641},{"coords":{"x":3493465,"y":5474354},"altitude":575},{"coords":{"x":3477593,"y":5465650},"altitude":427},{"coords":{"x":3467353,"y":5478962},"altitude":488},{"coords":{"x":3470937,"y":5491762},"altitude":541},{"coords":{"x":3471449,"y":5508658},"altitude":396},{"coords":{"x":3470937,"y":5491762},"altitude":541},{"coords":{"x":3467353,"y":5478962},"altitude":488},{"coords":{"x":3477593,"y":5465650},"altitude":427},{"coords":{"x":3493465,"y":5474354},"altitude":575},{"coords":{"x":3520089,"y":5471282},"altitude":641},{"coords":{"x":3542105,"y":5464626},"altitude":552},{"coords":{"x":3559513,"y":5472306},"altitude":625},{"coords":{"x":3576409,"y":5475378},"altitude":563},{"coords":{"x":3594329,"y":5482546},"altitude":558},{"coords":{"x":3610201,"y":5491250},"altitude":434},{"coords":{"x":3606105,"y":5518386},"altitude":451},{"coords":{"x":3581529,"y":5518386},"altitude":598},{"coords":{"x":3546201,"y":5508146},"altitude":563},{"coords":{"x":3515993,"y":5503538},"altitude":381},{"coords":{"x":3493465,"y":5531186},"altitude":321},{"coords":{"x":3505753,"y":5537842},"altitude":330},{"coords":{"x":3520089,"y":5551666},"altitude":214},{"coords":{"x":3509849,"y":5562930},"altitude":192},{"coords":{"x":3442265,"y":5534770},"altitude":361}]', '2009-07-05 20:18:21'),
('4a511a552898', '[{"coords":{"x":3446873,"y":5552178},"altitude":365},{"coords":{"x":3544665,"y":5551154},"altitude":241},{"coords":{"x":3553369,"y":5526066},"altitude":504},{"coords":{"x":3514457,"y":5502002},"altitude":484},{"coords":{"x":3467353,"y":5509170},"altitude":441},{"coords":{"x":3453017,"y":5496370},"altitude":483},{"coords":{"x":3440217,"y":5520946},"altitude":486},{"coords":{"x":3446873,"y":5552178},"altitude":365}]', '2009-07-05 23:25:41'),
('4a5a52ad457b', '[{"coords":{"x":50.027543667322206,"y":12.716935318299667},"alt":834},{"coords":{"x":50.49153049859114,"y":14.729418142081556},"alt":328},{"coords":{"x":49.578248615644064,"y":15.711442275891317},"alt":473},{"coords":{"x":49.30212415754254,"y":14.299473966087632},"alt":414},{"coords":{"x":50.027543667322206,"y":12.716935318299667},"alt":834}]', '2009-07-12 23:16:29'),
('4a5a53585248', '[{"coords":{"x":50.398160424379874,"y":12.007763634544578},"alt":551},{"coords":{"x":50.29188389645172,"y":17.820226395469017},"alt":244},{"coords":{"x":49.20404342243515,"y":16.99887004398369},"alt":288},{"coords":{"x":49.230499683999554,"y":14.862860579916655},"alt":465},{"coords":{"x":49.588785647420046,"y":14.550306209915501},"alt":441},{"coords":{"x":49.05205736930377,"y":13.280299099670666},"alt":655},{"coords":{"x":49.64675866311534,"y":12.153364185750743},"alt":387},{"coords":{"x":49.939216584014424,"y":12.064828430287143},"alt":697},{"coords":{"x":50.398160424379874,"y":12.007763634544578},"alt":551}]', '2009-07-12 23:19:20'),
('4a5a5bbd66d6', '[{"coords":{"x":49.19925395793193,"y":16.59025007518802},"alt":248},{"coords":{"x":49.20212778154264,"y":16.616498569554285},"alt":214},{"coords":{"x":49.1969910033985,"y":16.622645107643688},"alt":217},{"coords":{"x":49.19219464775022,"y":16.62542221764176},"alt":204},{"coords":{"x":49.19446908282698,"y":16.612571546032044},"alt":218},{"coords":{"x":49.18784046538451,"y":16.61399558260261},"alt":200},{"coords":{"x":49.19252034440801,"y":16.601410569489584},"alt":234},{"coords":{"x":49.1885201886794,"y":16.595005445873078},"alt":205},{"coords":{"x":49.18308031951766,"y":16.593806808579277},"alt":220},{"coords":{"x":49.1859982996076,"y":16.578862817323493},"alt":205},{"coords":{"x":49.19280223585389,"y":16.576852971981193},"alt":224},{"coords":{"x":49.19627238656585,"y":16.60023893481678},"alt":235},{"coords":{"x":49.19925395793193,"y":16.59025007518802},"alt":248}]', '2009-07-12 23:55:09'),
('4a5b5b6eaf31', '[{"coords":{"x":50.01362193506025,"y":13.574863226313754},"alt":464},{"coords":{"x":50.25579891749992,"y":17.78936873812454},"alt":291},{"coords":{"x":49.35085616016205,"y":17.49815309431892},"alt":209},{"coords":{"x":49.15678965249139,"y":15.171907767155263},"alt":558},{"coords":{"x":49.17912660387751,"y":13.879856350474219},"alt":512},{"coords":{"x":49.57003833496529,"y":13.446233741205782},"alt":563},{"coords":{"x":50.01362193506025,"y":13.574863226313754},"alt":464}]', '2009-07-13 18:06:06'),
('4a5b880e6a88', '{"name":"Vole","points":[{"coords":{"x":49.22880824768497,"y":16.54450962060991},"alt":241},{"coords":{"x":49.2340122282445,"y":16.56066182716342},"alt":251},{"coords":{"x":49.229498812709735,"y":16.566383674666625},"alt":309},{"coords":{"x":49.227825744929525,"y":16.55914783060837},"alt":241}],"length":"02515.15"}', '2009-07-13 21:16:30'),
('4a5b88d2e69b', '{"name":"","points":[{"coords":{"x":49.22962748599493,"y":16.54382080433692},"alt":241},{"coords":{"x":49.23819136508188,"y":16.584833331648294},"alt":244},{"coords":{"x":49.22460145082595,"y":16.582995415493766},"alt":265},{"coords":{"x":49.22238102207365,"y":16.560935903710224},"alt":231},{"coords":{"x":49.2219369648413,"y":16.549630147580377},"alt":228}],"length":"07082.41"}', '2009-07-13 21:19:46'),
('4a5ba943f4d', '{"name":"","points":[{"coords":{"x":49.22899665108639,"y":16.546135737930033},"alt":246},{"coords":{"x":49.231282931411464,"y":16.578242434824716},"alt":262}],"length":2343.7035879661476}', '2009-07-13 23:38:11'),
('4a5ca7cf417c', '{"name":"","points":[{"coords":{"x":49.21889710907024,"y":16.522046977090735},"alt":271},{"coords":{"x":49.22798084515897,"y":16.5499235826317},"alt":260},{"coords":{"x":49.22359892486287,"y":16.563578762272204},"alt":286},{"coords":{"x":49.21677349132621,"y":16.564269675159565},"alt":232},{"coords":{"x":49.211419173910905,"y":16.548037329779543},"alt":242},{"coords":{"x":49.21377340154522,"y":16.53439014336275},"alt":355},{"coords":{"x":49.21725810194168,"y":16.530495510430633},"alt":297},{"coords":{"x":49.21889710907024,"y":16.522046977090735},"alt":271}],"length":7589.183581404958}', '2009-07-14 17:44:15'),
('4a5d2bd8b3e', '{"name":"","points":[{"coords":{"x":49.20018624255232,"y":16.607984760637397},"alt":221},{"coords":{"x":49.198570083547644,"y":16.613772399588775},"alt":209},{"coords":{"x":49.19592741880954,"y":16.61630594482192},"alt":206},{"coords":{"x":49.193408592344305,"y":16.61650026086709},"alt":202},{"coords":{"x":49.190775859575616,"y":16.61406369290552},"alt":205},{"coords":{"x":49.190004663247706,"y":16.610326812310664},"alt":208},{"coords":{"x":49.19019017473668,"y":16.604776146650178},"alt":204},{"coords":{"x":49.19325211359944,"y":16.603056289098998},"alt":239},{"coords":{"x":49.193511217939104,"y":16.604669656593227},"alt":234},{"coords":{"x":49.19717629372402,"y":16.603291772205424},"alt":229},{"coords":{"x":49.198328409666686,"y":16.603211986198986},"alt":231},{"coords":{"x":49.20018624255232,"y":16.607984760637397},"alt":221}],"length":3548.0398406629747}', '2009-07-15 03:07:36'),
('4a5d373010a9', '{"name":"","points":[{"coords":{"x":50.136216156680376,"y":12.410938626997053},"alt":437},{"coords":{"x":50.1444561194608,"y":14.287277486876762},"alt":328},{"coords":{"x":49.960350542720754,"y":14.289992682619365},"alt":298},{"coords":{"x":49.59167717822038,"y":12.793999298377939},"alt":487},{"coords":{"x":50.136216156680376,"y":12.410938626997053},"alt":437}],"length":335441.26061097835}', '2009-07-15 03:56:00'),
('4a5ded4310c4', '{"name":"","points":[{"coords":{"x":49.22513790571328,"y":16.547330081927452},"alt":295},{"coords":{"x":49.236059945452354,"y":16.58386019760435},"alt":249},{"coords":{"x":49.22625979298299,"y":16.586477297664352},"alt":249},{"coords":{"x":49.22226603557252,"y":16.565926590508074},"alt":290}],"length":5577.0968978057645}', '2009-07-15 16:52:51'),
('4a5df21127a9', '{"name":"","points":[{"coords":{"x":49.22692723938847,"y":16.546038023492226},"alt":269},{"coords":{"x":49.22975510205067,"y":16.557280401911523},"alt":247}],"length":874.2849380287041}', '2009-07-15 17:13:21');

-- --------------------------------------------------------

--
-- Struktura tabulky `comments`
--

CREATE TABLE `comments` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `author` int(10) unsigned NOT NULL COMMENT 'user',
  `user` int(10) unsigned NOT NULL,
  `posted` datetime NOT NULL COMMENT 'date and time',
  `text` text collate utf8_czech_ci NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `author` (`author`),
  KEY `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci AUTO_INCREMENT=1 ;

--
-- Vypisuji data pro tabulku `comments`
--


-- --------------------------------------------------------

--
-- Struktura tabulky `points`
--

CREATE TABLE `points` (
  `id` bigint(20) unsigned NOT NULL auto_increment,
  `track` int(10) unsigned NOT NULL,
  `lat` double NOT NULL COMMENT 'latitude',
  `lng` double NOT NULL COMMENT 'longitude',
  `alt` int(10) unsigned default NULL COMMENT 'altitude',
  PRIMARY KEY  (`id`),
  KEY `lat` (`lat`),
  KEY `lng` (`lng`),
  KEY `track` (`track`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci AUTO_INCREMENT=337 ;

--
-- Vypisuji data pro tabulku `points`
--

INSERT INTO `points` (`id`, `track`, `lat`, `lng`, `alt`) VALUES
(69, 26, 49.22798, 16.54763, 259),
(70, 26, 49.22745, 16.55236, 259),
(71, 26, 49.22713, 16.55694, 247),
(72, 26, 49.22737, 16.56132, 243),
(73, 26, 49.22777, 16.56291, 253),
(74, 26, 49.22891, 16.56272, 245),
(75, 26, 49.22914, 16.5639, 267),
(76, 26, 49.23031, 16.56304, 259),
(77, 26, 49.23333, 16.56475, 288),
(78, 26, 49.23594, 16.56487, 289),
(79, 26, 49.23971, 16.55784, 265),
(80, 26, 49.23979, 16.54677, 282),
(81, 26, 49.23817, 16.54129, 268),
(82, 26, 49.23343, 16.54076, 265),
(83, 26, 49.22894, 16.54382, 241),
(84, 26, 49.22798, 16.54763, 248),
(85, 27, 50.08718, 14.66504, 256),
(86, 27, 50.08191, 14.66208, 262),
(87, 27, 50.08241, 14.66446, 265),
(88, 27, 50.07606, 14.70187, 286),
(89, 27, 50.08216, 14.70454, 267),
(90, 27, 50.08253, 14.70537, 265),
(91, 27, 50.08342, 14.70485, 264),
(92, 27, 50.09239, 14.70783, 252),
(93, 27, 50.09278, 14.70313, 256),
(94, 27, 50.09551, 14.70109, 259),
(95, 27, 50.09457, 14.69441, 266),
(96, 27, 50.09849, 14.6919, 271),
(97, 27, 50.09835, 14.68685, 257),
(98, 27, 50.09643, 14.68567, 264),
(99, 27, 50.09663, 14.67954, 269),
(100, 27, 50.09587, 14.67665, 268),
(101, 27, 50.09641, 14.6736, 264),
(102, 27, 50.0948, 14.67259, 266),
(103, 27, 50.09544, 14.66918, 267),
(104, 27, 50.09664, 14.66543, 271),
(105, 27, 50.09749, 14.66593, 267),
(106, 27, 50.09921, 14.65982, 273),
(107, 27, 50.09387, 14.64762, 268),
(108, 27, 50.08688, 14.6457, 251),
(109, 27, 50.08349, 14.64754, 254),
(110, 27, 50.08587, 14.65166, 256),
(111, 27, 50.08718, 14.66504, 256),
(112, 28, 49.19853, 16.59369, 240),
(113, 28, 49.1983, 16.59649, 232),
(114, 28, 49.19807, 16.5979, 232),
(115, 28, 49.19737, 16.59968, 228),
(116, 28, 49.1966, 16.60113, 233),
(117, 28, 49.19618, 16.6023, 234),
(118, 28, 49.1962, 16.60362, 231),
(119, 28, 49.19459, 16.60444, 238),
(120, 28, 49.19303, 16.60492, 234),
(121, 28, 49.1923, 16.60526, 234),
(122, 28, 49.19238, 16.60332, 229),
(123, 28, 49.19201, 16.60172, 222),
(124, 28, 49.19158, 16.6003, 218),
(125, 28, 49.19139, 16.59912, 219),
(126, 28, 49.19174, 16.5974, 211),
(127, 28, 49.19158, 16.59566, 210),
(128, 28, 49.19362, 16.59538, 221),
(129, 28, 49.19528, 16.59472, 236),
(130, 28, 49.19712, 16.59414, 243),
(131, 28, 49.19853, 16.59369, 240),
(132, 29, 49.27458, 16.43767, 238),
(133, 29, 49.26826, 16.43232, 250),
(134, 29, 49.26257, 16.43361, 288),
(135, 29, 49.25175, 16.42914, 313),
(136, 29, 49.25581, 16.4143, 355),
(137, 29, 49.25617, 16.40727, 386),
(138, 29, 49.25263, 16.40942, 395),
(139, 29, 49.25221, 16.4086, 397),
(140, 29, 49.25551, 16.40119, 432),
(141, 29, 49.26317, 16.39702, 300),
(142, 29, 49.26451, 16.40044, 288),
(143, 29, 49.26689, 16.39937, 297),
(144, 29, 49.26734, 16.40162, 289),
(145, 29, 49.27012, 16.40402, 284),
(146, 29, 49.26768, 16.40831, 263),
(147, 29, 49.26933, 16.41112, 269),
(148, 29, 49.26863, 16.41445, 274),
(149, 29, 49.27075, 16.4267, 267),
(150, 29, 49.2761, 16.43465, 236),
(151, 29, 49.27458, 16.43767, 238),
(152, 30, 49.21691, 16.55776, 209),
(153, 30, 49.21904, 16.57044, 250),
(163, 32, 49.22626, 16.5488, 281),
(164, 32, 49.23853, 16.70152, 373),
(165, 32, 49.2324, 16.8426, 447),
(166, 32, 49.28208, 17.01594, 250),
(167, 32, 49.35282, 17.25939, 214),
(168, 32, 49.31204, 17.42568, 189),
(169, 32, 49.32755, 17.48796, 198),
(170, 32, 49.33908, 17.58446, 233),
(171, 32, 49.41343, 17.70298, 345),
(172, 32, 49.48202, 17.98538, 355),
(173, 32, 49.46692, 18.16918, 394),
(174, 32, 49.56323, 18.22774, 425),
(177, 34, 49.17325, 16.4586, 384),
(178, 34, 49.17558, 16.44573, 407),
(179, 34, 49.17036, 16.43667, 302),
(180, 34, 49.16393, 16.43489, 282),
(181, 34, 49.15969, 16.43626, 357),
(182, 34, 49.15673, 16.44239, 322),
(183, 34, 49.15816, 16.45716, 354),
(184, 34, 49.16277, 16.46587, 346),
(185, 34, 49.1692, 16.4627, 382),
(186, 34, 49.17325, 16.4586, 384),
(187, 35, 49.93604, 17.87281, 276),
(188, 35, 49.93705, 17.91463, 250),
(189, 35, 49.93375, 17.90625, 268),
(190, 35, 49.93241, 17.88709, 270),
(191, 35, 49.93134, 17.87515, 271),
(192, 35, 49.93367, 17.868, 283),
(193, 35, 49.93608, 17.86721, 283),
(194, 35, 49.93408, 17.86279, 294),
(195, 35, 49.93987, 17.86175, 271),
(196, 35, 49.94257, 17.88185, 273),
(197, 35, 49.94016, 17.89114, 269),
(198, 35, 49.93604, 17.87281, 276),
(199, 36, 50.10761, 14.55992, 259),
(200, 36, 50.11058, 14.5857, 265),
(201, 36, 50.11214, 14.5961, 284),
(202, 36, 50.11411, 14.60878, 286),
(203, 36, 50.11682, 14.62322, 275),
(204, 36, 50.11854, 14.63053, 270),
(205, 36, 50.10702, 14.63159, 264),
(206, 36, 50.10269, 14.63273, 268),
(207, 36, 50.09848, 14.62018, 263),
(208, 36, 50.09899, 14.61014, 248),
(209, 36, 50.10015, 14.60347, 240),
(210, 36, 50.10267, 14.59651, 239),
(211, 36, 50.09886, 14.58783, 230),
(212, 36, 50.09702, 14.58077, 226),
(213, 36, 50.09571, 14.56999, 221),
(214, 36, 50.09619, 14.56131, 226),
(215, 36, 50.10761, 14.55992, 259),
(228, 39, 49.31102, 14.11894, 402),
(229, 39, 49.32134, 14.12759, 375),
(230, 39, 49.32331, 14.14895, 392),
(231, 39, 49.3226, 14.168, 414),
(232, 39, 49.31491, 14.17365, 511),
(233, 39, 49.30766, 14.17611, 495),
(234, 39, 49.29999, 14.17254, 446),
(235, 39, 49.29421, 14.16812, 400),
(236, 39, 49.29177, 14.1551, 378),
(237, 39, 49.29172, 14.13889, 398),
(238, 39, 49.3051, 14.117, 456),
(239, 39, 49.31102, 14.11894, 392),
(262, 41, 49.43588, 14.11865, 425),
(263, 41, 49.44354, 14.11743, 395),
(264, 41, 49.4485, 14.12939, 446),
(265, 41, 49.45025, 14.14606, 458),
(266, 41, 49.44674, 14.16152, 456),
(267, 41, 49.43846, 14.16476, 439),
(268, 41, 49.43282, 14.1603, 449),
(269, 41, 49.42831, 14.14836, 433),
(270, 41, 49.42625, 14.13388, 426),
(271, 41, 49.43162, 14.11968, 408),
(272, 41, 49.43588, 14.11865, 425),
(289, 43, 49.92772, 14.28839, 230),
(290, 43, 49.92451, 14.28385, 239),
(291, 43, 49.92197, 14.28406, 279),
(292, 43, 49.91846, 14.27632, 359),
(293, 43, 49.91479, 14.27537, 400),
(294, 43, 49.91208, 14.27294, 425),
(295, 43, 49.90935, 14.27051, 481),
(296, 43, 49.90687, 14.26749, 475),
(297, 43, 49.90727, 14.26912, 488),
(298, 43, 49.90352, 14.2718, 507),
(299, 43, 49.89907, 14.27084, 510),
(300, 43, 49.89327, 14.26672, 513),
(301, 43, 49.88752, 14.25987, 513),
(302, 43, 49.88824, 14.25625, 507),
(303, 43, 49.88885, 14.25567, 510),
(304, 43, 49.88714, 14.25657, 509),
(305, 43, 49.88465, 14.25279, 493),
(306, 43, 49.87985, 14.25248, 519),
(307, 43, 49.87703, 14.25409, 521),
(308, 43, 49.87674, 14.25138, 534),
(309, 43, 49.87447, 14.24783, 519),
(310, 43, 49.87207, 14.25274, 435),
(311, 43, 49.87135, 14.25852, 420),
(312, 43, 49.86885, 14.25971, 388),
(313, 43, 49.86848, 14.25642, 395),
(314, 43, 49.86735, 14.25527, 393),
(315, 43, 49.86518, 14.25669, 413),
(316, 43, 49.86687, 14.25932, 411),
(317, 43, 49.86578, 14.2604, 414),
(318, 43, 49.86619, 14.2578, 400),
(319, 43, 49.86518, 14.25655, 411),
(320, 43, 49.86659, 14.2611, 394),
(321, 44, 49.92772, 14.28839, 239),
(322, 44, 49.92197, 14.28406, 359),
(323, 44, 49.91479, 14.27537, 425),
(324, 44, 49.90935, 14.27051, 481),
(325, 44, 49.90727, 14.26912, 507),
(326, 44, 49.89907, 14.27084, 513),
(327, 44, 49.88752, 14.25987, 513),
(328, 44, 49.88885, 14.25567, 510),
(329, 44, 49.88465, 14.25279, 519),
(330, 44, 49.87703, 14.25409, 534),
(331, 44, 49.87447, 14.24783, 519),
(332, 44, 49.87135, 14.25852, 420),
(333, 44, 49.86848, 14.25642, 395),
(334, 44, 49.86518, 14.25669, 413),
(335, 44, 49.86578, 14.2604, 414),
(336, 44, 49.86518, 14.25655, 411);

-- --------------------------------------------------------

--
-- Struktura tabulky `tags`
--

CREATE TABLE `tags` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `name` varchar(200) collate utf8_czech_ci NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci AUTO_INCREMENT=1 ;

--
-- Vypisuji data pro tabulku `tags`
--


-- --------------------------------------------------------

--
-- Struktura tabulky `tracks`
--

CREATE TABLE `tracks` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `author` int(10) unsigned NOT NULL,
  `length` bigint(20) unsigned NOT NULL COMMENT 'in meters',
  `altitude` int(11) NOT NULL COMMENT 'difference in altitude, meters',
  `articulation` int(11) NOT NULL COMMENT 'difference between min and max altitude',
  `created` datetime NOT NULL,
  `name` varchar(100) collate utf8_czech_ci NOT NULL,
  `description` text collate utf8_czech_ci,
  PRIMARY KEY  (`id`),
  KEY `author` (`author`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci AUTO_INCREMENT=45 ;

--
-- Vypisuji data pro tabulku `tracks`
--

INSERT INTO `tracks` (`id`, `author`, `length`, `altitude`, `articulation`, `created`, `name`, `description`) VALUES
(26, 2, 5404, 0, 0, '2009-07-14 20:06:20', 'Komínské kolečko', 'Takové menší kolečko po Komínských polích. Co dodat :) .'),
(27, 2, 13492, 0, 0, '2009-07-14 20:09:17', 'Klánovický les', 'Pokus o fakt dlouhý popis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sagittis sem quis urna vestibulum eu ultrices ligula molestie. Vivamus hendrerit porta tincidunt. Morbi ultrices ultrices arcu sit amet porttitor. Maecenas in a'),
(28, 2, 2752, 0, 0, '2009-07-15 01:49:03', 'Okolo Špilberku', NULL),
(29, 2, 10472, 0, 0, '2009-07-15 14:45:11', 'Gargamel', NULL),
(30, 2, 950, 0, 0, '2009-07-15 16:31:30', 'Okolo zoo', NULL),
(32, 2, 137835, 0, 0, '2009-07-15 17:31:43', 'Czechoslovakia in Sweden', NULL),
(34, 2, 6797, 0, 0, '2009-07-15 18:58:24', 'Reggae', NULL),
(35, 2, 11390, 0, 0, '2009-07-15 19:10:48', 'Maruškááá', 'Popis trasy. Bla bla bla bla.'),
(36, 4, 13713, 0, 0, '2009-07-15 21:24:13', 'Zuzančina trasa', 'Takové malé počernické kolečko. Juch!'),
(39, 3, 12635, 0, 0, '2009-07-16 01:30:12', 'Moje první trasa', 'Okolo Písku.'),
(41, 3, 9674, 255, 85, '2009-07-16 21:41:23', 'Správná trasa', 'Popisek.'),
(43, 3, 13409, 1873, 362, '2009-07-18 04:05:15', 'ušima', NULL),
(44, 3, 13409, 1966, 362, '2009-07-18 04:07:20', 'B32', NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `tracks_tags`
--

CREATE TABLE `tracks_tags` (
  `track` int(10) unsigned NOT NULL,
  `tag` int(10) unsigned NOT NULL,
  PRIMARY KEY  (`track`,`tag`),
  KEY `tag` (`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;

--
-- Vypisuji data pro tabulku `tracks_tags`
--


-- --------------------------------------------------------

--
-- Struktura tabulky `tracks_users`
--

CREATE TABLE `tracks_users` (
  `track` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `markers` text collate utf8_czech_ci,
  PRIMARY KEY  (`track`,`user`),
  KEY `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;

--
-- Vypisuji data pro tabulku `tracks_users`
--

INSERT INTO `tracks_users` (`track`, `user`, `markers`) VALUES
(26, 2, NULL),
(27, 2, NULL),
(28, 2, NULL),
(28, 3, NULL),
(29, 2, NULL),
(29, 3, NULL),
(30, 2, NULL),
(30, 3, NULL),
(32, 2, NULL),
(32, 4, NULL),
(34, 2, NULL),
(35, 2, NULL),
(35, 4, NULL),
(36, 4, NULL),
(39, 3, NULL),
(41, 3, NULL),
(41, 4, NULL),
(43, 3, NULL),
(44, 3, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `users`
--

CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `username` varchar(200) collate utf8_czech_ci NOT NULL COMMENT 'openID',
  `fullname` varchar(100) collate utf8_czech_ci NOT NULL COMMENT 'name, surname, ...',
  `description` text collate utf8_czech_ci COMMENT 'about user',
  `place` varchar(200) collate utf8_czech_ci default NULL COMMENT 'initial point for map',
  `weight` smallint(6) default NULL COMMENT 'weight in kg',
  `height` smallint(6) default NULL COMMENT 'height in cm',
  `email` varchar(30) collate utf8_czech_ci default NULL,
  `female` tinyint(1) NOT NULL default '0' COMMENT 'gender (is female?)',
  `admin` tinyint(1) NOT NULL default '0' COMMENT 'permissions (is admin?)',
  `active` tinyint(1) NOT NULL default '1' COMMENT 'if banned or not',
  PRIMARY KEY  (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci AUTO_INCREMENT=5 ;

--
-- Vypisuji data pro tabulku `users`
--

INSERT INTO `users` (`id`, `username`, `fullname`, `description`, `place`, `weight`, `height`, `email`, `female`, `admin`, `active`) VALUES
(2, 'littlemaple.myopenid.com', 'Honza Javorek', 'Victor Cibich byl proslulý svou láskou k pivu Březňák nejen ve Velkém Březně, ale i okolí. V roce 1906 ho proto oslovila správní rada s nabídkou stát se tváří piva Březňák a Cibich rád souhlasil. Jeho portrét se od té doby objevoval na etiketách, reklamních cedulích, inzertních a propagačních materiálech všeho druhu. Jako protihodnotu dostal doživotní rentu 30 piv týdně, kterou si vychutnával v restauraci Tivoli ve Velkém Březně.', 'Kolejní, Brno', 52, 170, 'honza@javorek.net', 0, 1, 1),
(3, 'littlemaple.id.seznam.cz', 'Honza Javorek', 'Testovací profil, OpenID na Seznam.cz.', 'Varvažov', 55, 177, 'littlemaple@seznam.cz', 0, 0, 1),
(4, 'trekmap.id.email.cz', 'Zuzana Trekmapová', '', 'Praha 9, Horní Počernice', 60, NULL, 'trekmap@email.cz', 1, 0, 1);

--
-- Omezení pro exportované tabulky
--

--
-- Omezení pro tabulku `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `achievements_ibfk_15` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `achievements_ibfk_16` FOREIGN KEY (`track`) REFERENCES `tracks` (`id`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`author`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `points`
--
ALTER TABLE `points`
  ADD CONSTRAINT `points_ibfk_1` FOREIGN KEY (`track`) REFERENCES `tracks` (`id`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `tracks`
--
ALTER TABLE `tracks`
  ADD CONSTRAINT `tracks_ibfk_1` FOREIGN KEY (`author`) REFERENCES `users` (`id`);

--
-- Omezení pro tabulku `tracks_tags`
--
ALTER TABLE `tracks_tags`
  ADD CONSTRAINT `tracks_tags_ibfk_1` FOREIGN KEY (`track`) REFERENCES `tracks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tracks_tags_ibfk_2` FOREIGN KEY (`tag`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `tracks_users`
--
ALTER TABLE `tracks_users`
  ADD CONSTRAINT `tracks_users_ibfk_1` FOREIGN KEY (`track`) REFERENCES `tracks` (`id`),
  ADD CONSTRAINT `tracks_users_ibfk_2` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE;
