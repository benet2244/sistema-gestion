<?php
// backend/obtener_amenazas.php

header("Access-Control-Allow-Origin: http://localhost:3001");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(["message" => "Error de conexión con la base de datos."]);
    exit();
}

// MODO 1: Devolver datos para los gráficos y KPIs del Dashboard
if (!isset($_GET['month']) && !isset($_GET['year'])) {

    $response_data = [];

    // --- Consulta 1: Resumen mensual (para el gráfico de LÍNEAS) ---
    $query_resumen = "
        SELECT 
            YEAR(fecha) AS anio,
            MONTH(fecha) AS mes_num,
            SUM(malware + phishing + comando_y_control + criptomineria + denegacion_de_servicios + intentos_conexion_bloqueados) AS total_amenazas
        FROM amenazas_diarias
        GROUP BY anio, mes_num
        ORDER BY anio, mes_num;
    ";
    $stmt_resumen = $db->prepare($query_resumen);
    $stmt_resumen->execute();
    $result_resumen = $stmt_resumen->get_result();
    $resumen = [];
    while ($row = $result_resumen->fetch_assoc()) {
        $resumen[] = $row;
    }
    $response_data['threatsPerMonth'] = $resumen;
    $stmt_resumen->close();

    // --- Consulta 2: Distribución de amenazas (para el gráfico de BARRAS HORIZONTAL) ---
    $query_distribucion = "
        SELECT 'Malware' as name, SUM(malware) as value FROM amenazas_diarias UNION ALL
        SELECT 'Phishing' as name, SUM(phishing) as value FROM amenazas_diarias UNION ALL
        SELECT 'Comando y Control' as name, SUM(comando_y_control) as value FROM amenazas_diarias UNION ALL
        SELECT 'Criptominería' as name, SUM(criptomineria) as value FROM amenazas_diarias UNION ALL
        SELECT 'Denegación de Servicios' as name, SUM(denegacion_de_servicios) as value FROM amenazas_diarias UNION ALL
        SELECT 'Conexiones Bloqueadas' as name, SUM(intentos_conexion_bloqueados) as value FROM amenazas_diarias
        ORDER BY value DESC;
    ";
    $stmt_distribucion = $db->prepare($query_distribucion);
    $stmt_distribucion->execute();
    $result_distribucion = $stmt_distribucion->get_result();
    $distribucion = [];
    while ($row = $result_distribucion->fetch_assoc()) {
        $distribucion[] = $row;
    }
    $response_data['threatsBySubclass'] = $distribucion;
    $stmt_distribucion->close();

    // --- Consulta 3: KPIs (Total de amenazas y Promedio por día) ---
    $query_kpi = "SELECT SUM(total_amenazas) as grand_total, AVG(total_amenazas) as average_daily FROM (SELECT (malware + phishing + comando_y_control + criptomineria + denegacion_de_servicios + intentos_conexion_bloqueados) as total_amenazas FROM amenazas_diarias) as daily_totals";
    $stmt_kpi = $db->prepare($query_kpi);
    $stmt_kpi->execute();
    $result_kpi = $stmt_kpi->get_result();
    $kpi_data = $result_kpi->fetch_assoc();
    $response_data['kpis'] = [
        "totalThreats" => (int)$kpi_data['grand_total'],
        "avgThreatsPerDay" => round((float)$kpi_data['average_daily'], 2)
    ];
    $stmt_kpi->close();

    http_response_code(200);
    echo json_encode($response_data);

} else {
    // MODO 2: Devolver datos detallados para la tabla de edición (sin cambios)
    $month = $_GET['month'];
    $year = $_GET['year'];
    
    $query = "SELECT * FROM amenazas_diarias WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param("ii", $month, $year);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $datos_existentes = [];
    while ($row = $result->fetch_assoc()) {
        $datos_existentes[$row['fecha']] = $row;
    }
    $stmt->close();

    $registros = [];
    $dias_en_mes = cal_days_in_month(CAL_GREGORIAN, $month, $year);

    for ($d = 1; $d <= $dias_en_mes; $d++) {
        $fecha = sprintf('%d-%02d-%02d', $year, $month, $d);
        if (isset($datos_existentes[$fecha])) {
            $registros[] = $datos_existentes[$fecha];
        } else {
            $registros[] = [
                "fecha" => $fecha, "malware" => 0, "phishing" => 0, "comando_y_control" => 0,
                "criptomineria" => 0, "denegacion_de_servicios" => 0, "intentos_conexion_bloqueados" => 0
            ];
        }
    }
    
    http_response_code(200);
    echo json_encode(['registros' => $registros]);
}

$db->close();
?>