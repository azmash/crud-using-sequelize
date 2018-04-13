-- MySQL dump 10.13  Distrib 5.7.21, for osx10.13 (x86_64)
--
-- Host: localhost    Database: stu
-- ------------------------------------------------------
-- Server version	5.7.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary table structure for view `frekuensi`
--

DROP TABLE IF EXISTS `frekuensi`;
/*!50001 DROP VIEW IF EXISTS `frekuensi`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `frekuensi` AS SELECT 
 1 AS `month`,
 1 AS `Frek`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student` (
  `id_student` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `gender` enum('f','m') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `adm_date` date DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_student`)
) ENGINE=InnoDB AUTO_INCREMENT=411231149 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (411231101,'DIASA','KENDAL','f','1994-07-21','2018-03-10','dias@gmail.com'),(411231102,'FAQIH','KUDUS','m','1995-07-12','2018-03-10','faqih@unnes.ac.id'),(411231103,'RAHMA','KUDUS','f','1996-03-14','2018-01-10','rahma@gmail.com'),(411231104,'AJI','PURWODADI','m','1995-05-16','2018-01-30','aji@gmail.com'),(411231105,'AMMAR','PATI','m','1995-11-16','2018-01-29','ammar@gmail.com'),(411231106,'LATIFA','DEMAK','f','1996-09-26','2017-09-21','latifa@gmail.com'),(411231107,'NURUL','SUKOHARJO','f','1994-12-16','2018-01-10','nurul@gmail.com'),(411231108,'AKIF','PATI','m','1995-12-17','2018-03-01','akif@gmail.com'),(411231109,'FIA','KENDARI','f','1995-12-26','2018-01-11','fia@gmail.com'),(411231110,'FADHIL','MALANG','m','1996-07-24','2017-08-21','fadhil@rz.com'),(411231130,'DESI','YOGYAKARTA','f','1995-06-06','2018-03-13','desi@wb.com'),(411231131,'ULFA','PADANG','f','1994-11-24','2018-03-13','upa@rp.com'),(411231133,'RISTI','DEMAK','f','1992-06-24','2018-03-13','risti@rp.co'),(411231134,'RIZKI','JAMBI','m','1995-03-16','2017-07-21','rz@gf.com'),(411231135,'LUTHFA','GUNUNG KIDUL','f','2018-12-21','2018-03-14','lf@kd.co'),(411231147,'IZZA','KLATEN','f','1997-03-30','2016-09-21','izaa@mu.co'),(411231148,'RIMA','SEMARANG','f','1990-03-23','2016-09-21','rm@gz.kl');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `password` varchar(100) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `pw_token` varchar(250) DEFAULT NULL,
  `pw_exp` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (10,'admin','$2a$10$geQUcr2UNuxvLwKC.OY8kuG7NSEKVlz77cMU2E949gJosDeX6iq3S','azm.sholihah@gmail.com',NULL,NULL),(11,'admin1','$2a$05$lhjjzyHpKXHi6pvwz1UB2e32jF7FJc/uzGrp79j0FYfzsme5AiMvy','vy.phera@gmail.com',NULL,NULL),(22,'admin2','$2a$10$57XQItqlZiEpJXYXR8F6P.80tX131OPDaZPGOt3arbNpDXApUwTJi','stat.mie@gmail.com','cc93e6119f6a45b9b32c7f3f920d56d1ccc111ba','2018-03-20 08:52:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `frekuensi`
--

/*!50001 DROP VIEW IF EXISTS `frekuensi`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `frekuensi` AS select month(`student`.`adm_date`) AS `month`,count(0) AS `Frek` from `student` group by month(`student`.`adm_date`) */;
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

-- Dump completed on 2018-03-20  9:28:07
