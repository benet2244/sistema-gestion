CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Podríamos añadir más tablas después, como 'incidentes', 'clientes', etc.

-- Ejecutar en la base de datos 'gestion_incidentes_db'

CREATE TABLE detecciones (
    id_deteccion INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    source_ip VARCHAR(45) NOT NULL,
    target_ip VARCHAR(45) NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    detection_description TEXT NOT NULL,
    severity ENUM('Baja', 'Media', 'Alta', 'Crítica') NOT NULL,
    estado ENUM('Abierta', 'Pendiente', 'Cerrada') NOT NULL DEFAULT 'Abierta',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
