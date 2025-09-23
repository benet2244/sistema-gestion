<?php
ini_set('display_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username   = "Gestion";
$password   = "";
$dbname     = "gestion_incidentes";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "Error de conexión: " . $conn->connect_error]));
}

// --- Filter Logic (copied from robust script) ---
$year = isset($_GET['year']) ? intval($_GET['year']) : null;
$month = isset($_GET['month']) ? intval($_GET['month']) : null;
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;

$whereClause = "";
$types = "";
$params = [];

if ($startDate && $endDate) {
    $esc_startDate = $conn->real_escape_string($startDate);
    $esc_endDate = $conn->real_escape_string($endDate);
    $whereClause = " WHERE fecha BETWEEN '$esc_startDate' AND '$esc_endDate' ";
} elseif ($year && $month) {
    $esc_year = intval($year);
    $esc_month = intval($month);
    $whereClause = " WHERE YEAR(fecha) = $esc_year AND MONTH(fecha) = $esc_month ";
} elseif ($year) {
    $esc_year = intval($year);
    $whereClause = " WHERE YEAR(fecha) = $esc_year ";
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Se requiere un filtro de fecha válido."]);
    $conn->close();
    exit;
}

// --- Final Data Structure ---
$trendData = [];
$totals = null;
$actorSummary = [];

// === QUERY 1: Trend Data (Grouped) ===
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

$result_trend = $conn->query($sql_trend);
if (!$result_trend) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error en consulta de tendencias: " . $conn->error, "query" => $sql_trend]);
    $conn->close();
    exit;
}
while($row = $result_trend->fetch_assoc()) {
    $trendData[] = $row;
}

// === QUERY 2: Totals (Aggregated) ===
$sql_totals = "SELECT 
    SUM(malware) as total_malware, SUM(phishing) as total_phishing,
    SUM(comando_y_control) as total_comando_y_control, SUM(criptomineria) as total_criptomineria,
    SUM(denegacion_de_servicios) as total_denegacion_de_servicios, SUM(intentos_de_conexion) as total_intentos_de_conexion
FROM `bitacora_registros_diarios` 
$whereClause";

$result_totals = $conn->query($sql_totals);
if ($result_totals && $result_totals->num_rows > 0) {
    $totals = $result_totals->fetch_assoc();
} else {
    // If totals query fails, it's not ideal, but we can proceed with what we have
    $totals = []; 
}

// === QUERY 3: Actor Summary ===
$sql_actors = "SELECT actor_amenaza, COUNT(*) as count 
         FROM `bitacora_amenazas` 
         $whereClause 
         GROUP BY actor_amenaza 
         HAVING actor_amenaza IS NOT NULL AND actor_amenaza != ''
         ORDER BY count DESC";

$result_actors = $conn->query($sql_actors);
if ($result_actors) {
    while ($row = $result_actors->fetch_assoc()) {
        $actorSummary[] = ['actor' => $row['actor_amenaza'], 'count' => $row['count']];
    }
}

$conn->close();

// --- Final JSON Response ---
echo json_encode([
    "success" => true,
    "data" => [
        "trend" => $trendData,
        "totals" => $totals,
        "actorSummary" => $actorSummary
    ]
]);
?>