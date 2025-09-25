<?php
// backend/obtener_detecciones.php
header("Access-Control-Allow-Origin: http://localhost:3001");
header("Content-Type: application/json; charset=UTF-8");

require 'database.php';

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
    $where_clause = "WHERE MONTH(fecha_incidente) = ? AND YEAR(fecha_incidente) = ?";

    // --- Resumen por Severidad ---
    $query_prioridad = "SELECT severity, COUNT(*) as total FROM detecciones {$where_clause} GROUP BY severity ORDER BY FIELD(severity, 'Alta', 'Media', 'Baja')";
    $stmt_prioridad = $db->prepare($query_prioridad);
    $stmt_prioridad->bind_param("ii", $month, $year);
    $stmt_prioridad->execute();
    $response_data['prioritySummary'] = $stmt_prioridad->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt_prioridad->close();

    // --- Resumen por Estado ---
    $query_estado = "SELECT estado, COUNT(*) as total FROM detecciones {$where_clause} GROUP BY estado ORDER BY estado";
    $stmt_estado = $db->prepare($query_estado);
    $stmt_estado->bind_param("ii", $month, $year);
    $stmt_estado->execute();
    $response_data['statusSummary'] = $stmt_estado->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt_estado->close();

    // --- KPIs numéricos ---
    $query_kpis = "
        SELECT 
            (SELECT COUNT(*) FROM detecciones WHERE MONTH(fecha_incidente) = ? AND YEAR(fecha_incidente) = ?) as total,
            (SELECT COUNT(*) FROM detecciones WHERE fecha_incidente >= CURDATE() - INTERVAL 1 DAY) as today,
            (SELECT COUNT(*) FROM detecciones WHERE severity = 'Alta' AND MONTH(fecha_incidente) = ? AND YEAR(fecha_incidente) = ?) as high,
            (SELECT COUNT(*) FROM detecciones WHERE estado IN ('Abierta', 'En Proceso') AND MONTH(fecha_incidente) = ? AND YEAR(fecha_incidente) = ?) as pending,
            (SELECT COUNT(*) FROM detecciones WHERE estado = 'Cerrada' AND MONTH(fecha_incidente) = ? AND YEAR(fecha_incidente) = ?) as resolved
    ";
    $stmt_kpis = $db->prepare($query_kpis);
    $stmt_kpis->bind_param("iiiiiiii", $month, $year, $month, $year, $month, $year, $month, $year);
    $stmt_kpis->execute();
    $kpi_data = $stmt_kpis->get_result()->fetch_assoc();
    $response_data['kpis'] = array_map('intval', $kpi_data);
    $stmt_kpis->close();

    // --- Últimos 5 incidentes ---
    $query_recent = "SELECT id_deteccion, tipo_incidente, severity, fecha_incidente, responsable, estado FROM detecciones ORDER BY fecha_incidente DESC LIMIT 5";
    $stmt_recent = $db->prepare($query_recent);
    $stmt_recent->execute();
    $response_data['recentIncidents'] = $stmt_recent->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt_recent->close();

    http_response_code(200);
    echo json_encode($response_data);

} else {
    // MODO LISTA: Devolver TODAS las columnas para la tabla y el formulario de edición
    $query = "SELECT 
                id_deteccion, source_ip, target_ip, hostname, detection_description, 
                severity, estado, acciones_tomadas, cantidad_detecciones, dependencia, 
                detalles, direccion_mac, equipo_afectado, estado_equipo, fecha_incidente, 
                hash_url, nivel_amenaza, responsable, tipo_incidente
              FROM detecciones";
    if ($is_filtered) {
        $query .= " WHERE MONTH(fecha_incidente) = ? AND YEAR(fecha_incidente) = ?";
    }
    $query .= " ORDER BY fecha_incidente DESC";

    $stmt = $db->prepare($query);
    if ($is_filtered) {
        $stmt->bind_param("ii", $month, $year);
    }
    $stmt->execute();
    
    $result = $stmt->get_result();
    $registros = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    http_response_code(200);
    echo json_encode(["registros" => $registros]);
}

$db->close();
?>
