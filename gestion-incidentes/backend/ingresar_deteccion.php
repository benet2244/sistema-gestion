<?php
header("Access-Control-Allow-Origin: http://localhost:3001");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->hostname) && !empty($data->detection_description) && !empty($data->severity)) {
    
    $query = "INSERT INTO detecciones (hostname, source_ip, target_ip, detection_description, severity, estado) VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    
    // Asignar "Abierta" por defecto si no se proporciona un estado
    $estado = !empty($data->estado) ? $data->estado : 'Abierta';

    $stmt->bind_param("ssssss", 
        $data->hostname,
        $data->source_ip,
        $data->target_ip,
        $data->detection_description,
        $data->severity,
        $estado
    );

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(array("success" => true, "message" => "Detección ingresada correctamente."));
    } else {
        http_response_code(503);
        echo json_encode(array("success" => false, "message" => "Error al registrar la detección."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Datos incompletos."));
}

$db->close();
?>
