<?php
header("Access-Control-Allow-Origin: http://localhost:3001");
header("Content-Type: application/json; charset=UTF-8");

include_once 'database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(["message" => "Error de conexión con la base de datos."]);
    exit();
}

// La consulta SQL ahora incluye el campo 'estado'
$query = "SELECT id_deteccion as id, hostname, source_ip, target_ip, detection_description as descripcion, severity as prioridad, estado, fecha_registro as fecha_reporte FROM detecciones ORDER BY fecha_registro DESC";

$result = $db->query($query);

if ($result) {
    $num = $result->num_rows;
    if ($num > 0) {
        $detecciones_arr = array();
        $detecciones_arr["registros"] = array();

        while ($row = $result->fetch_assoc()) {
            array_push($detecciones_arr["registros"], $row);
        }

        http_response_code(200);
        echo json_encode($detecciones_arr);
    } else {
        http_response_code(200); // OK, pero no hay registros
        echo json_encode(["registros" => []]);
    }
} else {
    http_response_code(500); // Error del servidor
    echo json_encode(["message" => "Error al ejecutar la consulta.", "error" => $db->error]);
}

$db->close();
?>
