CREATE DATABASE IF NOT EXISTS `gestion_incidentes_db`;
USE `gestion_incidentes_db`;

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
-- Estructura para la tabla `detecciones`
--
CREATE TABLE `detecciones` (
  `id_deteccion` int(11) NOT NULL AUTO_INCREMENT,
  `hostname` varchar(255) DEFAULT NULL,
  `source_ip` varchar(45) DEFAULT NULL,
  `target_ip` varchar(45) DEFAULT NULL,
  `detection_description` TEXT DEFAULT NULL,
  `severity` enum('Baja','Media','Alta') NOT NULL,
  `estado` enum('Nuevo','En Proceso','Cerrado') NOT NULL DEFAULT 'Nuevo',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `tipo_incidente` varchar(255) DEFAULT NULL,
  `fecha_incidente` date DEFAULT NULL,
  `responsable` varchar(255) DEFAULT NULL,
  `equipo_afectado` varchar(255) DEFAULT NULL,
  `direccion_mac` varchar(17) DEFAULT NULL,
  `dependencia` varchar(255) DEFAULT NULL,
  `cantidad_detecciones` int(11) DEFAULT 0,
  `estado_equipo` varchar(100) DEFAULT NULL,
  `acciones_tomadas` text DEFAULT NULL,
  `hash_url` text DEFAULT NULL,
  `nivel_amenaza` varchar(100) DEFAULT NULL,
  `detalles` text DEFAULT NULL,
  PRIMARY KEY (`id_deteccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- ESTRUCTURAS PARA EL NUEVO MÓDULO DE BITÁCORA DE INCIDENTES
-- --------------------------------------------------------

CREATE TABLE `incidentes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(255) NOT NULL,
  `investigador_principal` VARCHAR(255),
  `estado` VARCHAR(50),
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tablas para cada sección del formulario, con nombres cortos y normalizados

CREATE TABLE `inc_asignacionFlujo` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `flujo_de_trabajo` TEXT, `dirigir` TEXT, `respondedor_#1` TEXT, `respondedor_#2` TEXT, `respondedor_#3` TEXT, `respondedor_#4` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_rastreadorFlujo` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `enviado_por` TEXT, `fecha/hora_de_adición` TEXT, `categoría` TEXT, `notas` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_listaControl` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `enviado_por` TEXT, `fecha/hora_de_adición` TEXT, `categoría` TEXT, `notas` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_notasInvestigacion` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `enviado_por` TEXT, `fecha/hora_de_adición` TEXT, `categoría` TEXT, `notas` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_cronologia` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `enviado_por` TEXT, `tipo` TEXT, `estado` TEXT, `fecha/hora_(UTC)` TEXT, `nombre_del_sistema` TEXT, `usuario/cuenta` TEXT, `actividad` TEXT, `fuente_de_evidencia` TEXT, `ip_de_origen` TEXT, `ip_de_destino` TEXT, `detalles/comentarios` TEXT, `mapeo_a_att&ck` TEXT, `padre/hijo` TEXT, `notas` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_sistemas` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `ubicación` TEXT, `nombre_de_host` TEXT, `dirección_ip` TEXT, `dominio` TEXT, `rol_del_sistema` TEXT, `sistema_operativo` TEXT, `detalles/comentarios` TEXT, `notas` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_cuentas` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `id_de_asset` TEXT, `estado` TEXT, `rol_de_la_cuenta` TEXT, `nombre_de_la_cuenta` TEXT, `sid` TEXT, `dominio` TEXT, `detalles/comentarios` TEXT, `colección_más_temprana_(UTC)` TEXT, `última_evidencia_(UTC)` TEXT, `notas` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_indicadoresHost` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `id_del_indicador` TEXT, `enviado_por` TEXT, `estado` TEXT, `tipo_de_indicador` TEXT, `indicador` TEXT, `descripción_compleja_o_nombre` TEXT, `hash` TEXT, `md5` TEXT, `sha1` TEXT, `sha256` TEXT, `detalles/comentarios` TEXT, `colección_más_temprana_(UTC)` TEXT, `última_evidencia_(UTC)` TEXT, `mapeo_att&ck` TEXT, `fuente` TEXT, `notas` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_indicadoresRed` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `id_del_indicador` TEXT, `enviado_por` TEXT, `estado` TEXT, `tipo_de_indicador` TEXT, `indicador` TEXT, `detalles/comentarios` TEXT, `evidencia_más_temprana_(UTC)` TEXT, `última_evidencia_(UTC)` TEXT, `alineación_att&ck` TEXT, `fuente` TEXT, `notas` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_inteligencia` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `id_de_consulta` TEXT, `enviado_por` TEXT, `estado` TEXT, `solicitud_de_información` TEXT, `respuesta` TEXT, `fuente` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_evidencia` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `ubicación_de_la_evidencia` TEXT, `notas` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_aplicaciones` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `ID_de_la_aplicación` TEXT, `Enviado_por` TEXT, `Estado` TEXT, `Nombre_de_la_aplicación` TEXT, `Nivel_de_aplicación` TEXT, `Rol_de_la_aplicación` TEXT, `Grupo_propietario` TEXT, `Líder_inicial` TEXT, `Hallazgos` TEXT, `evidencia_más_temprana_(UTC)` TEXT, `Última_evidencia_(UTC)` TEXT, `Fuente` TEXT, `Notas` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_palabrasClave` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `ID_de_palabra_clave` TEXT, `Palabras_clave_forenses_de_alta_fidelidad` TEXT, `Nota` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inc_consultas` (
    id INT AUTO_INCREMENT PRIMARY KEY, `incidente_id` INT, FOREIGN KEY (`incidente_id`) REFERENCES `incidentes`(`id`) ON DELETE CASCADE,
    `ID_de_consulta` TEXT, `Enviado_por` TEXT, `Plataforma` TEXT, `Objetivo` TEXT, `Consulta` TEXT, `Notas` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
