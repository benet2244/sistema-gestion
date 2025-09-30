

-- Ejecutar en la base de datos 'gestion_incidentes_db'


CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detecciones (
    id_deteccion INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    source_ip VARCHAR(45),
    target_ip VARCHAR(45),
    hostname VARCHAR(255),
    detection_description TEXT,
    severity ENUM('Baja', 'Media', 'Alta', 'Crítica'),
    estado VARCHAR(20) DEFAULT 'Abierta',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    acciones_tomadas TEXT,
    cantidad_detecciones INT,
    dependencia VARCHAR(255),
    detalles TEXT,
    direccion_mac VARCHAR(17),
    equipo_afectado VARCHAR(255),
    estado_equipo VARCHAR(255),
    fecha_incidente DATE,
    hash_url TEXT,
    nivel_amenaza VARCHAR(255),
    responsable VARCHAR(255),
    tipo_incidente VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `amenazas_diarias` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `malware` INT NOT NULL DEFAULT 0,
  `phishing` INT NOT NULL DEFAULT 0,
  `comando_y_control` INT NOT NULL DEFAULT 0,
  `criptomineria` INT NOT NULL DEFAULT 0,
  `denegacion_de_servicios` INT NOT NULL DEFAULT 0,
  `intentos_conexion_bloqueados` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fecha_unica` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Tablas para cada sección de Bitacora, con nombres cortos y normalizados

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

