-- MariaDB dump 10.18  Distrib 10.5.8-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: nekretnine
-- ------------------------------------------------------
-- Server version	10.5.8-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `lokacije`
--

DROP TABLE IF EXISTS `lokacije`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lokacije` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `ime` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nekretnine`
--

DROP TABLE IF EXISTS `nekretnine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nekretnine` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `v_id` tinyint(3) unsigned NOT NULL,
  `ime` varchar(35) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_nekretnine_vrste` (`v_id`) USING BTREE,
  CONSTRAINT `FK_nekretnine_vrste` FOREIGN KEY (`v_id`) REFERENCES `vrste` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `poruke`
--

DROP TABLE IF EXISTS `poruke`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `poruke` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `p_id` mediumint(8) unsigned DEFAULT NULL,
  `poruka` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `poruke_FK` (`p_id`),
  CONSTRAINT `poruke_FK` FOREIGN KEY (`p_id`) REFERENCES `prostori` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prostori`
--

DROP TABLE IF EXISTS `prostori`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prostori` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `n_id` smallint(6) unsigned NOT NULL,
  `izdavanje` tinyint(1) NOT NULL,
  `broj_soba` float NOT NULL,
  `cena` mediumint(8) unsigned DEFAULT NULL,
  `stara_cena` mediumint(8) unsigned DEFAULT NULL,
  `kvadrati` smallint(6) unsigned DEFAULT NULL,
  `spratnost` tinyint(4) unsigned DEFAULT NULL,
  `karakteristike` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opis` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lokacija` varchar(37) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EUR',
  `top` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_prostori_nekretnine` (`n_id`),
  KEY `prostori_broj_soba_IDX` (`broj_soba`) USING BTREE,
  KEY `prodaja` (`izdavanje`) USING BTREE,
  CONSTRAINT `FK_prostori_nekretnine` FOREIGN KEY (`n_id`) REFERENCES `nekretnine` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prostorulice`
--

DROP TABLE IF EXISTS `prostorulice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prostorulice` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `p_id` mediumint(8) unsigned DEFAULT NULL,
  `u_id` mediumint(8) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_prostor-ulice_prostori` (`p_id`),
  KEY `FK_prostor-ulice_ulice` (`u_id`),
  CONSTRAINT `FK_prostor-ulice_prostori` FOREIGN KEY (`p_id`) REFERENCES `prostori` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_prostor-ulice_ulice` FOREIGN KEY (`u_id`) REFERENCES `ulice` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reklame`
--

DROP TABLE IF EXISTS `reklame`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reklame` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `poruka` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `slika` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `slike`
--

DROP TABLE IF EXISTS `slike`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `slike` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `p_id` mediumint(8) unsigned NOT NULL,
  `slika` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `FK_slike_prostori` (`p_id`),
  CONSTRAINT `slike_FK` FOREIGN KEY (`id`) REFERENCES `prostori` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `top_ponude`
--

DROP TABLE IF EXISTS `top_ponude`;
/*!50001 DROP VIEW IF EXISTS `top_ponude`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `top_ponude` (
  `id` tinyint NOT NULL,
  `cena` tinyint NOT NULL,
  `stara_cena` tinyint NOT NULL,
  `kvadrati` tinyint NOT NULL,
  `broj_soba` tinyint NOT NULL,
  `spratnost` tinyint NOT NULL,
  `lokacija` tinyint NOT NULL,
  `currency` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `ulice`
--

DROP TABLE IF EXISTS `ulice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ulice` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `l_id` smallint(5) unsigned NOT NULL,
  `ime` varchar(35) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ulice_lokacije` (`l_id`),
  CONSTRAINT `FK_ulice_lokacije` FOREIGN KEY (`l_id`) REFERENCES `lokacije` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vrste`
--

DROP TABLE IF EXISTS `vrste`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vrste` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `ime` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `top_ponude`
--

/*!50001 DROP TABLE IF EXISTS `top_ponude`*/;
/*!50001 DROP VIEW IF EXISTS `top_ponude`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `top_ponude` AS select `prostori`.`id` AS `id`,`prostori`.`cena` AS `cena`,`prostori`.`stara_cena` AS `stara_cena`,`prostori`.`kvadrati` AS `kvadrati`,`prostori`.`broj_soba` AS `broj_soba`,`prostori`.`spratnost` AS `spratnost`,`prostori`.`lokacija` AS `lokacija`,`prostori`.`currency` AS `currency` from `prostori` where `prostori`.`top` = 1 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-11-21 18:37:35
