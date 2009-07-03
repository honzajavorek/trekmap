-- phpMyAdmin SQL Dump
-- version 2.10.1
-- http://www.phpmyadmin.net
-- 
-- Počítač: localhost
-- Vygenerováno: Pátek 03. července 2009, 03:20
-- Verze MySQL: 5.0.45
-- Verze PHP: 5.2.5

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- 
-- Databáze: `trekmap`
-- 

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
('4a4796e9b226', '[{"coords":{"x":3389273,"y":5475378},"altitude":526},{"coords":{"x":3495769,"y":5535282},"altitude":419}]', '2009-06-28 18:14:33');

-- --------------------------------------------------------

-- 
-- Struktura tabulky `users`
-- 

CREATE TABLE `users` (
  `id` mediumint(8) unsigned zerofill NOT NULL auto_increment COMMENT 'id',
  `username` varchar(200) collate utf8_czech_ci NOT NULL COMMENT 'login',
  `fullname` varchar(100) collate utf8_czech_ci NOT NULL COMMENT 'name, surname, ...',
  `description` text collate utf8_czech_ci COMMENT 'about user',
  `email` varchar(30) collate utf8_czech_ci NOT NULL COMMENT 'e-mail address',
  `female` tinyint(1) NOT NULL default '0' COMMENT 'gender (is female?)',
  `admin` tinyint(1) NOT NULL default '0' COMMENT 'permissions (is admin?)',
  `active` tinyint(1) NOT NULL default '1' COMMENT 'if banned or not',
  PRIMARY KEY  (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci AUTO_INCREMENT=3 ;

-- 
-- Vypisuji data pro tabulku `users`
-- 

INSERT INTO `users` (`id`, `username`, `fullname`, `description`, `email`, `female`, `admin`, `active`) VALUES 
(00000002, 'littlemaple.myopenid.com', 'Honza Javorek', 'Victor Cibich byl proslulý svou láskou k pivu Březňák nejen ve Velkém Březně, ale i okolí. V roce 1906 ho proto oslovila správní rada s nabídkou stát se tváří piva Březňák a Cibich rád souhlasil. Jeho portrét se od té doby objevoval na etiketách, reklamních cedulích, inzertních a propagačních materiálech všeho druhu. Jako protihodnotu dostal doživotní rentu 30 piv týdně, kterou si vychutnával v restauraci Tivoli ve Velkém Březně.', 'honza@javorek.net', 0, 1, 1);
