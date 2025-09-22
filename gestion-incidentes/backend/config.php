<?php
// Configuración de cabeceras CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejar la solicitud OPTIONS previa a la petición (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Detalles de la base de datos para XAMPP
$servername = "localhost";
$username = "Gestion"; // <-- CAMBIAR A 'sistema_web'
$password = ""; // La contraseña por defecto en XAMPP suele ser vacía
$dbname = "gestion_incidentes"; // Nombre de la base de datos de incidentes

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode(["error" => "Error de conexión: " . $conn->connect_error]));
}
?>