<?php
header("Access-Control-Allow-Origin: http://localhost:3001");
header("Content-Type: application/json; charset=UTF-8");

require_once 'models/Deteccion.php';

$database = new Database();
$db = $database->getConnection();

$deteccion = new Deteccion($db);

$stmt = $deteccion->leer();
$num = $stmt->num_rows;

if ($num > 0) {
    $incidentes_arr = array();
    $incidentes_arr["registros"] = array();

    while ($row = $stmt->fetch_assoc()) {
        extract($row);
        $incidente_item = array(
            "id" => $id_deteccion,
            "hostname" => $hostname,
            "source_ip" => $source_ip,
            "target_ip" => $target_ip,
            "descripcion" => $detection_description,
            "prioridad" => $severity,
            "estado" => $estado, // Campo dinámico desde la BD
            "fecha_reporte" => $fecha_registro
        );
        array_push($incidentes_arr["registros"], $incidente_item);
    }

    http_response_code(200);
    echo json_encode($incidentes_arr);
} else {
    http_response_code(404);
    echo json_encode(array("registros" => [], "mensaje" => "No se encontraron detecciones."));
}

$db->close();
?>
