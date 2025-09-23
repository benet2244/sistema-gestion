<?php
// Guardián de seguridad: verifica si el usuario ha iniciado sesión.
require_once 'session_secure.php';
// Incluir el archivo de configuración de la base de datos
require_once 'config.php';

// Cabeceras estándar para la API
// header('Access-Control-Allow-Origin: *'); // Reemplazado por el guardián
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Manejar la solicitud de "pre-vuelo" (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Lógica de Filtros ---
$year = isset($_GET['year']) ? intval($_GET['year']) : null;
$month = isset($_GET['month']) ? intval($_GET['month']) : null;
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;

$whereClause = "";
$types = "";
$params = [];

if ($startDate && $endDate) {
    $whereClause = " WHERE fecha BETWEEN ? AND ? ";
    $types = "ss";
    $params = [$startDate, $endDate];
} elseif ($year && $month) {
    $whereClause = " WHERE YEAR(fecha) = ? AND MONTH(fecha) = ? ";
    $types = "ii";
    $params = [$year, $month];
} elseif ($year) {
    $whereClause = " WHERE YEAR(fecha) = ? ";
    $types = "i";
    $params = [$year];
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Se requiere un filtro de fecha válido (year, year/month, o start_date/end_date)."]);
    $conn->close();
    exit;
}

// --- Función para ejecutar consultas preparadas de forma segura ---
function execute_query($conn, $sql, $types, $params) {
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al preparar la consulta: " . $conn->error]);
        $conn->close();
        exit;
    }
    if ($types) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();
    return $result;
}

// === CONSULTA 1: Datos de Tendencia ===
$groupingUnit = ($year && $month) ? "DAY(fecha)" : (($startDate && $endDate) ? "DATE(fecha)" : "MONTH(fecha)");
$sql_trend = "SELECT 
    $groupingUnit as trend_unit,
    SUM(malware) as total_malware, SUM(phishing) as total_phishing,
    SUM(comando_y_control) as total_comando_y_control, SUM(criptomineria) as total_criptomineria,
    SUM(denegacion_de_servicios) as total_denegacion_de_servicios, SUM(intentos_de_conexion) as total_intentos_de_conexion
FROM `bitacora_registros_diarios` 
$whereClause 
GROUP BY $groupingUnit
ORDER BY $groupingUnit ASC";

$result_trend = execute_query($conn, $sql_trend, $types, $params);
$trendData = $result_trend->fetch_all(MYSQLI_ASSOC);

// === CONSULTA 2: Totales Agregados ===
$sql_totals = "SELECT 
    SUM(malware) as total_malware, SUM(phishing) as total_phishing,
    SUM(comando_y_control) as total_comando_y_control, SUM(criptomineria) as total_criptomineria,
    SUM(denegacion_de_servicios) as total_denegacion_de_servicios, SUM(intentos_de_conexion) as total_intentos_de_conexion
FROM `bitacora_registros_diarios` 
$whereClause";

$result_totals = execute_query($conn, $sql_totals, $types, $params);
$totals = $result_totals->fetch_assoc();

// === CONSULTA 3: Resumen de Actores ===
// Nota: Esta consulta asume que `bitacora_amenazas` también tiene una columna `fecha` para filtrar.
$sql_actors = "SELECT actor_amenaza, COUNT(*) as count 
         FROM `bitacora_amenazas` 
         $whereClause 
         GROUP BY actor_amenaza 
         HAVING actor_amenaza IS NOT NULL AND actor_amenaza != ''
         ORDER BY count DESC";

$result_actors = execute_query($conn, $sql_actors, $types, $params);
$actorSummary = $result_actors->fetch_all(MYSQLI_ASSOC);

$conn->close();

// --- Respuesta Final en JSON ---
echo json_encode([
    "success" => true,
    "data" => [
        "trend" => $trendData,
        "totals" => $totals,
        "actorSummary" => $actorSummary
    ]
]);
?>