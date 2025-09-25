<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:3001");
header("Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// PASO 1: INCLUIR LA CLASE Y CREAR LA CONEXIÓN
require 'database.php'; // Carga la clase Database

$database = new Database();
$db = $database->getConnection(); // Crea el objeto de conexión $db

// PASO 2: VERIFICAR LA CONEXIÓN INMEDIATAMENTE
if ($db === null || $db->connect_error) {
    http_response_code(500); // Internal Server Error
    $error_message = 'Error Crítico: Falla al crear la conexión a la base de datos desde database.php.';
    if ($db && $db->connect_error) {
        $error_message .= ' Detalles: ' . $db->connect_error;
    }
    echo json_encode(['success' => false, 'message' => $error_message]);
    exit();
}

// Función de respuesta estandarizada
function sendJsonResponse($success, $message = '') {
    http_response_code($success ? 200 : 400);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!is_object($data)) {
    sendJsonResponse(false, 'Error: No se recibieron datos válidos en formato JSON.');
}

// --- EXTRACCIÓN SEGURA Y VALIDACIÓN ---
$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$source_ip = $data->source_ip ?? null;
$target_ip = $data->target_ip ?? null;
$hostname = $data->hostname ?? null;
$detection_description = $data->detection_description ?? null;
$severity = $data->severity ?? 'Media';
$estado = $data->estado ?? 'Abierta';
$acciones_tomadas = $data->acciones_tomadas ?? null;
$cantidad_detecciones = (isset($data->cantidad_detecciones) && is_numeric($data->cantidad_detecciones)) ? intval($data->cantidad_detecciones) : null;
$dependencia = $data->dependencia ?? null;
$detalles = $data->detalles ?? null;
$direccion_mac = $data->direccion_mac ?? null;
$equipo_afectado = $data->equipo_afectado ?? null;
$estado_equipo = $data->estado_equipo ?? null;
$fecha_incidente = $data->fecha_incidente ?? null;
$hash_url = $data->hash_url ?? null;
$nivel_amenaza = $data->nivel_amenaza ?? null;
$responsable = $data->responsable ?? null;
$tipo_incidente = $data->tipo_incidente ?? null;

if (empty($tipo_incidente)) sendJsonResponse(false, "Error de validación: El campo 'Tipo de Incidente' es obligatorio.");
if (empty($fecha_incidente)) sendJsonResponse(false, "Error de validación: El campo 'Fecha del Incidente' es obligatorio.");
if (empty($responsable)) sendJsonResponse(false, "Error de validación: El campo 'Responsable' es obligatorio.");

// --- LÓGICA DE BASE DE DATOS ---
try {
    if ($id) { // UPDATE
        $query = "UPDATE detecciones SET source_ip=?, target_ip=?, hostname=?, detection_description=?, severity=?, estado=?, acciones_tomadas=?, cantidad_detecciones=?, dependencia=?, detalles=?, direccion_mac=?, equipo_afectado=?, estado_equipo=?, fecha_incidente=?, hash_url=?, nivel_amenaza=?, responsable=?, tipo_incidente=? WHERE id_deteccion=?";
        $stmt = $db->prepare($query);
        if ($stmt === false) sendJsonResponse(false, 'Error Interno (DB Prepare - UPDATE): ' . $db->error);
        $stmt->bind_param('sssssssissssssssssi', $source_ip, $target_ip, $hostname, $detection_description, $severity, $estado, $acciones_tomadas, $cantidad_detecciones, $dependencia, $detalles, $direccion_mac, $equipo_afectado, $estado_equipo, $fecha_incidente, $hash_url, $nivel_amenaza, $responsable, $tipo_incidente, $id);
    } else { // INSERT
        $query = "INSERT INTO detecciones (source_ip, target_ip, hostname, detection_description, severity, estado, acciones_tomadas, cantidad_detecciones, dependencia, detalles, direccion_mac, equipo_afectado, estado_equipo, fecha_incidente, hash_url, nivel_amenaza, responsable, tipo_incidente) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        if ($stmt === false) sendJsonResponse(false, 'Error Interno (DB Prepare - INSERT): ' . $db->error);
        $stmt->bind_param('sssssssissssssssss', $source_ip, $target_ip, $hostname, $detection_description, $severity, $estado, $acciones_tomadas, $cantidad_detecciones, $dependencia, $detalles, $direccion_mac, $equipo_afectado, $estado_equipo, $fecha_incidente, $hash_url, $nivel_amenaza, $responsable, $tipo_incidente);
    }

    if ($stmt->execute()) {
        $message = $id ? 'Incidente actualizado con éxito.' : 'Incidente guardado con éxito.';
        sendJsonResponse(true, $message);
    } else {
        sendJsonResponse(false, 'Error al ejecutar la consulta: ' . $stmt->error);
    }

    $stmt->close();
    $db->close();

} catch (Throwable $e) {
    sendJsonResponse(false, 'Excepción del servidor: ' . $e->getMessage());
}
?>
