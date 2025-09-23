<?php

const DB_HOST = 'localhost';


const DB_USER = 'root';

/** Tu contraseña para la base de datos */
const DB_PASS = 'root';


const DB_NAME = 'gestion_incidentes';



/**
 * Función para establecer una conexión a la base de datos usando MySQLi.
 *
 * @return mysqli La conexión a la base de datos.
 * @throws Exception Si la conexión falla.
 */
function connect_db(): mysqli
{
    // Crear una nueva instancia de mysqli
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    // Verificar si la conexión falló
    if ($conn->connect_error) {
        // En lugar de morir, se lanza una excepción para un manejo de errores más flexible.
        // En un entorno de producción, los detalles del error no deberían ser visibles.
        throw new Exception("Error de conexión a la base de datos: " . $conn->connect_error);
    }

    // Establecer el juego de caracteres a UTF-8 para una correcta codificación
    if (!$conn->set_charset("utf8mb4")) {
        // Se puede registrar este fallo si es necesario, pero la conexión sigue siendo válida.
    }

    return $conn;
}

try {
    $conn = connect_db();
} catch (Exception $e) {
    // Si la conexión falla, se captura la excepción y se maneja el error.
    http_response_code(503); // Service Unavailable
    // Solo en un entorno de desarrollo se debe mostrar el mensaje de error de la excepción.
    $errorMessage = "Error crítico: No se pudo conectar a la base de datos.";
    if (getenv('ENVIRONMENT') === 'development') {
        $errorMessage .= " Detalle: " . $e->getMessage();
    }
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "message" => $errorMessage
    ]);
    die();
}