<?php
// backend/obtener_detecciones.php
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

// MODO 1: Devolver resúmenes y KPIs para el Dashboard
if (isset($_GET['summary']) && $_GET['summary'] === 'dashboard') {
    
    $response_data = [];

    // --- Consulta de KPI: Total de Detecciones ---
    $query_kpi = "SELECT COUNT(*) as totalDetections FROM detecciones";
    $stmt_kpi = $db->prepare($query_kpi);
    $stmt_kpi->execute();
    $result_kpi = $stmt_kpi->get_result();
    $kpi_data = $result_kpi->fetch_assoc();
    $response_data['kpis'] = [
        "totalDetections" => (int)$kpi_data['totalDetections']
    ];
    $stmt_kpi->close();

    // --- Consulta 1: Resumen por Prioridad ---
    $query_prioridad = "SELECT severity as prioridad, COUNT(*) as total FROM detecciones GROUP BY severity ORDER BY FIELD(severity, 'Alta', 'Media', 'Baja')";
    $stmt_prioridad = $db->prepare($query_prioridad);
    $stmt_prioridad->execute();
    $result_prioridad = $stmt_prioridad->get_result();
    $resumen_prioridad = [];
    while ($row = $result_prioridad->fetch_assoc()) {
        $resumen_prioridad[] = $row;
    }
    $response_data['prioritySummary'] = $resumen_prioridad;
    $stmt_prioridad->close();

    // --- Consulta 2: Resumen por Estado ---
    $query_estado = "SELECT estado, COUNT(*) as total FROM detecciones GROUP BY estado ORDER BY estado";
    $stmt_estado = $db->prepare($query_estado);
    $stmt_estado->execute();
    $result_estado = $stmt_estado->get_result();
    $resumen_estado = [];
    while ($row = $result_estado->fetch_assoc()) {
        $resumen_estado[] = $row;
    }
    $response_data['statusSummary'] = $resumen_estado;
    $stmt_estado->close();

    http_response_code(200);
    echo json_encode($response_data);

} else {
    // MODO 2: Devolver la lista completa de detecciones (comportamiento por defecto)
    $query = "SELECT id_deteccion as id, hostname, source_ip, target_ip, detection_description as descripcion, severity as prioridad, estado, fecha_registro as fecha_reporte FROM detecciones ORDER BY fecha_registro DESC";
    
    $result = $db->query($query);
    
    if ($result) {
        $detecciones_arr = ["registros" => []];
        while ($row = $result->fetch_assoc()) {
            array_push($detecciones_arr["registros"], $row);
        }
        http_response_code(200);
        echo json_encode($detecciones_arr);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Error al obtener las detecciones."]);
    }
}

$db->close();
?>