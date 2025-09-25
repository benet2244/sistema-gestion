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

// --- CONFIGURACIÓN DE FECHA ---
$month = isset($_GET['month']) ? (int)$_GET['month'] : date('m');
$year = isset($_GET['year']) ? (int)$_GET['year'] : date('Y');
$is_filtered = isset($_GET['month']) && isset($_GET['year']);

// MODO: Devolver resúmenes y KPIs para el Dashboard
if (isset($_GET['summary']) && $_GET['summary'] === 'dashboard') {
    
    $response_data = [];
    $where_clause = "WHERE MONTH(fecha_registro) = ? AND YEAR(fecha_registro) = ?";

    // --- Consulta 1: Resumen por Prioridad (filtrado por fecha) ---
    $query_prioridad = "SELECT severity as prioridad, COUNT(*) as total FROM detecciones {$where_clause} GROUP BY severity ORDER BY FIELD(severity, 'Alta', 'Media', 'Baja')";
    $stmt_prioridad = $db->prepare($query_prioridad);
    $stmt_prioridad->bind_param("ii", $month, $year);
    $stmt_prioridad->execute();
    $result_prioridad = $stmt_prioridad->get_result();
    $resumen_prioridad = [];
    while ($row = $result_prioridad->fetch_assoc()) {
        $resumen_prioridad[] = $row;
    }
    $response_data['prioritySummary'] = $resumen_prioridad;
    $stmt_prioridad->close();

    // --- Consulta 2: Resumen por Estado (filtrado por fecha) ---
    $query_estado = "SELECT estado, COUNT(*) as total FROM detecciones {$where_clause} GROUP BY estado ORDER BY estado";
    $stmt_estado = $db->prepare($query_estado);
    $stmt_estado->bind_param("ii", $month, $year);
    $stmt_estado->execute();
    $result_estado = $stmt_estado->get_result();
    $resumen_estado = [];
    while ($row = $result_estado->fetch_assoc()) {
        $resumen_estado[] = $row;
    }
    $response_data['statusSummary'] = $resumen_estado;
    $stmt_estado->close();

    // --- Consulta 3: KPIs numéricos (CORREGIDO) ---
    $query_kpis = "
        SELECT 
            (SELECT COUNT(*) FROM detecciones WHERE MONTH(fecha_registro) = ? AND YEAR(fecha_registro) = ?) as total,
            (SELECT COUNT(*) FROM detecciones WHERE fecha_registro >= CURDATE() - INTERVAL 1 DAY) as today,
            (SELECT COUNT(*) FROM detecciones WHERE severity = 'Alta' AND MONTH(fecha_registro) = ? AND YEAR(fecha_registro) = ?) as high,
            (SELECT COUNT(*) FROM detecciones WHERE estado IN ('Nuevo', 'En Proceso') AND MONTH(fecha_registro) = ? AND YEAR(fecha_registro) = ?) as pending,
            (SELECT COUNT(*) FROM detecciones WHERE estado = 'Cerrado' AND MONTH(fecha_registro) = ? AND YEAR(fecha_registro) = ?) as resolved
    ";
    $stmt_kpis = $db->prepare($query_kpis);
    // CORREGIDO: El número de parámetros es 8, no 10.
    $stmt_kpis->bind_param("iiiiiiii", $month, $year, $month, $year, $month, $year, $month, $year);
    $stmt_kpis->execute();
    $kpi_data = $stmt_kpis->get_result()->fetch_assoc();
    $response_data['kpis'] = array_map('intval', $kpi_data);
    $stmt_kpis->close();

    // --- Consulta 4: Últimos 5 incidentes (sin cambios) ---
    $query_recent = "SELECT id_deteccion as id, tipo_incidente, severity as prioridad, fecha_registro as fecha_incidente, responsable, estado as estado_equipo FROM detecciones ORDER BY fecha_registro DESC LIMIT 5";
    $stmt_recent = $db->prepare($query_recent);
    $stmt_recent->execute();
    $result_recent = $stmt_recent->get_result();
    $recent_incidents = [];
    while ($row = $result_recent->fetch_assoc()) {
        $recent_incidents[] = $row;
    }
    $response_data['recentIncidents'] = $recent_incidents;
    $stmt_recent->close();

    http_response_code(200);
    echo json_encode($response_data);

} else {
    // MODO LISTA: Devolver detecciones con filtro de fecha
    $query = "SELECT id_deteccion as id, hostname, source_ip, target_ip, detection_description as descripcion, severity as prioridad, estado, fecha_registro as fecha_reporte FROM detecciones";
    if ($is_filtered) {
        $query .= " WHERE MONTH(fecha_registro) = ? AND YEAR(fecha_registro) = ?";
    }
    $query .= " ORDER BY fecha_registro DESC";

    $stmt = $db->prepare($query);
    if ($is_filtered) {
        $stmt->bind_param("ii", $month, $year);
    }
    $stmt->execute();
    
    $result = $stmt->get_result();
    $detecciones_arr = ["registros" => []];
    while ($row = $result->fetch_assoc()) {
        array_push($detecciones_arr["registros"], $row);
    }
    $stmt->close();

    http_response_code(200);
    echo json_encode($detecciones_arr);
}

$db->close();
?>
