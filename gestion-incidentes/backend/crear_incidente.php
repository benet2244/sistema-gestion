<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../database/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(["success" => false, "message" => "Error de conexión con la base de datos."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->title) || !isset($data->lead_investigator) || !isset($data->formData)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
    exit();
}

$db->begin_transaction();

try {
    // 1. Insertar el incidente principal
    $stmt = $db->prepare("INSERT INTO incidentes (titulo, investigador_principal, estado) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $data->title, $data->lead_investigator, $data->status);
    $stmt->execute();
    $incidente_id = $db->insert_id;
    $stmt->close();

    // 2. Iterar sobre cada sección del formulario y guardar los datos
    foreach ($data->formData as $section => $rows) {
        if (!is_array($rows) || empty($rows)) continue;

        $tableName = "inc_" . $section; // ej: inc_asignacionFlujo

        foreach ($rows as $row) {
            $row = (array)$row; // Convertir a array asociativo
            $columns = array_keys($row);
            $placeholders = implode(', ', array_fill(0, count($columns), '?'));
            $column_names = implode(', ', array_map(function($col) use ($db) {
                return "`" . $db->real_escape_string(str_replace(' ', '_', $col)) . "`";
            }, $columns));

            $sql = "INSERT INTO $tableName (incidente_id, $column_names) VALUES (? $placeholders)";
            $stmt = $db->prepare($sql);
            
            $types = 'i' . str_repeat('s', count($columns));
            $values = array_values($row);
            $stmt->bind_param($types, $incidente_id, ...$values);
            $stmt->execute();
            $stmt->close();
        }
    }

    $db->commit();
    http_response_code(201);
    echo json_encode(["success" => true, "message" => "Incidente creado con éxito", "incidente_id" => $incidente_id]);

} catch (Exception $e) {
    $db->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al crear el incidente: " . $e->getMessage()]);
}

$db->close();
