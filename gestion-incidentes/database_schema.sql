

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


ALTER TABLE usuarios MODIFY contrasena VARCHAR(255) NOT NULL;
