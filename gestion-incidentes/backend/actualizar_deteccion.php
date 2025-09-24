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

if (!empty($data->id) && !empty($data->hostname) && !empty($data->detection_description) && !empty($data->severity) && !empty($data->estado)) {
    $query = "UPDATE detecciones SET hostname = ?, source_ip = ?, target_ip = ?, detection_description = ?, severity = ?, estado = ? WHERE id_deteccion = ?";

    $stmt = $db->prepare($query);
    $stmt->bind_param("ssssssi", 
        $data->hostname,
        $data->source_ip,
        $data->target_ip,
        $data->detection_description,
        $data->severity,
        $data->estado,
        $data->id
    );

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("success" => true, "message" => "Detección actualizada."));
    } else {
        http_response_code(503);
        echo json_encode(array("success" => false, "message" => "No se pudo actualizar la detección."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Datos incompletos para actualizar."));
}

$db->close();
?>
