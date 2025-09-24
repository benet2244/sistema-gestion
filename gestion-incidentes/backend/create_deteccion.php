<?php
// Incluir archivos de configuración y base de datos
include_once 'database.php';

// --- Configuración de CORS y Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array("mensaje" => "Error: Solamente se acepta el método POST."));
    exit();
}
// --- Fin Headers ---

// Conexión a la base de datos
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(array("mensaje" => "Error de conexión con la base de datos."));
    exit();
}

// Obtener datos del cuerpo de la solicitud JSON
$data = json_decode(file_get_contents("php://input"));

// Validación de datos
if (empty($data->source_ip) || empty($data->target_ip) || empty($data->hostname) || empty($data->detection_description) || empty($data->severity)) {
    http_response_code(400); 
    echo json_encode(array("mensaje" => "Error: Faltan datos obligatorios para registrar la detección."));
    exit();
}

// Escapar y limpiar datos
$source_ip = $db->real_escape_string($data->source_ip);
$target_ip = $db->real_escape_string($data->target_ip);
$hostname = $db->real_escape_string($data->hostname);
$description = $db->real_escape_string($data->detection_description);
$severity = $db->real_escape_string($data->severity);


// Consulta SQL para insertar la nueva detección
$query = "INSERT INTO detecciones (source_ip, target_ip, hostname, detection_description, severity) 
          VALUES ('$source_ip', '$target_ip', '$hostname', '$description', '$severity')";

if ($db->query($query)) {
    // Éxito en la inserción
    http_response_code(201); // 201 Created
    echo json_encode(array("mensaje" => "Detección de CrowdStrike registrada correctamente."));
} else {
    // Error en la consulta SQL
    http_response_code(500); // Error interno del servidor
    echo json_encode(array("mensaje" => "Error al guardar la detección: " . $db->error));
}

$db->close();
// Se omite la etiqueta de cierre '?>' para prevenir problemas de headers.