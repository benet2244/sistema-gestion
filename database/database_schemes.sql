CREATE DATABASE IF NOT EXISTS `ciberseg`;
USE `ciberseg`;

--
-- Estructura para la tabla `usuarios`
--
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('administrador','usuario') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Estructura para la tabla `amenazas`
--
CREATE TABLE `amenazas` (
  `id_amenaza` int(11) NOT NULL AUTO_INCREMENT,
  `threat_class` varchar(100) NOT NULL,
  `threat_subclass` varchar(100) NOT NULL,
  `event_time` datetime NOT NULL,
  `source_ip` varchar(45) DEFAULT NULL,
  `target_ip` varchar(45) DEFAULT NULL,
  `hostname` varchar(100) DEFAULT NULL,
  `rule_id` varchar(20) DEFAULT NULL,
  `rule_name` varchar(255) DEFAULT NULL,
  `severity` enum('Baja','Media','Alta') NOT NULL,
  PRIMARY KEY (`id_amenaza`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Estructura para la tabla `detecciones` (MODIFICADA PARA EL NUEVO FORMULARIO)
--
CREATE TABLE `detecciones` (
  `id_deteccion` int(11) NOT NULL AUTO_INCREMENT,
  `hostname` varchar(255) DEFAULT NULL,
  `source_ip` varchar(45) DEFAULT NULL,      -- Campo original
  `target_ip` varchar(45) DEFAULT NULL,      -- Campo original
  `detection_description` TEXT DEFAULT NULL, -- Campo original (asegurado como TEXT)
  `severity` enum('Baja','Media','Alta') NOT NULL,
  `estado` enum('Nuevo','En Proceso','Cerrado') NOT NULL DEFAULT 'Nuevo',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `tipo_incidente` varchar(255) DEFAULT NULL,
  `fecha_incidente` date DEFAULT NULL,
  `responsable` varchar(255) DEFAULT NULL,
  `equipo_afectado` varchar(255) DEFAULT NULL,
  `direccion_mac` varchar(17) DEFAULT NULL, -- Formato XX:XX:XX:XX:XX:XX
  `dependencia` varchar(255) DEFAULT NULL,
  `cantidad_detecciones` int(11) DEFAULT 0,
  `estado_equipo` varchar(100) DEFAULT NULL,
  `acciones_tomadas` text DEFAULT NULL,
  `hash_url` text DEFAULT NULL,             -- Para guardar el IOC analizado
  `nivel_amenaza` varchar(100) DEFAULT NULL, -- Para el resultado del análisis
  `detalles` text DEFAULT NULL,              -- Detalles adicionales

  PRIMARY KEY (`id_deteccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


