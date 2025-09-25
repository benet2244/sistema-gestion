<?php
// backend/guardar_amenazas.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(["message" => "Error de conexión con la base de datos."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->fecha) && isset($data->malware) && isset($data->phishing) && isset($data->comando_y_control) && isset($data->criptomineria) && isset($data->denegacion_de_servicios) && isset($data->intentos_conexion_bloqueados)) {
    
    $query = "INSERT INTO amenazas_diarias (fecha, malware, phishing, comando_y_control, criptomineria, denegacion_de_servicios, intentos_conexion_bloqueados) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE malware=VALUES(malware), phishing=VALUES(phishing), comando_y_control=VALUES(comando_y_control), criptomineria=VALUES(criptomineria), denegacion_de_servicios=VALUES(denegacion_de_servicios), intentos_conexion_bloqueados=VALUES(intentos_conexion_bloqueados)";
    
    $stmt = $db->prepare($query);

    // Limpiar y asignar variables
    $fecha = htmlspecialchars(strip_tags($data->fecha));
    $malware = intval($data->malware);
    $phishing = intval($data->phishing);
    $comando_y_control = intval($data->comando_y_control);
    $criptomineria = intval($data->criptomineria);
    $denegacion_de_servicios = intval($data->denegacion_de_servicios);
    $intentos_conexion_bloqueados = intval($data->intentos_conexion_bloqueados);

    $stmt->bind_param("siiiiii", $fecha, $malware, $phishing, $comando_y_control, $criptomineria, $denegacion_de_servicios, $intentos_conexion_bloqueados);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "Datos guardados exitosamente."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Error al guardar los datos.", "error" => $stmt->error]);
    }
    $stmt->close();
} else {
    http_response_code(400);
    echo json_encode(["message" => "Datos incompletos."]);
}

$db->close();
?>