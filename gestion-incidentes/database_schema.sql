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
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;