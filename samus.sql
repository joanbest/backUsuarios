-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
-- Host: localhost    Database: pweb
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;


DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `nombre_usuario` varchar(45) DEFAULT NULL,
  `contrasena_usuario` varchar(45) DEFAULT NULL,
  `rol` varchar(45) NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `usuarios` WRITE;
INSERT INTO `usuarios` VALUES 
('admin','admin','coordinador',7),
('estudiante','123','estudiante',10),
('docente','123','docente',11);
UNLOCK TABLES;

