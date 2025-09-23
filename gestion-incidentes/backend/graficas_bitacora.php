<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// --- Database Connection ---
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "gestion_incidentes";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Error de conexión: " . $conn->connect_error]);
    exit;
}

// --- Filter Logic ---
$year = isset($_GET['year']) ? intval($_GET['year']) : null;
$month = isset($_GET['month']) ? intval($_GET['month']) : null;
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;

$params = [];
$types = "";
$whereClause = "";

// Build WHERE clause for both queries based on provided filters
if ($startDate && $endDate) {
    $whereClause = " WHERE fecha BETWEEN ? AND ? ";
    $types = "ss";
    array_push($params, $startDate, $endDate);
} elseif ($year && $month) {
    $whereClause = " WHERE YEAR(fecha) = ? AND MONTH(fecha) = ? ";
    $types = "ii";
    array_push($params, $year, $month);
} elseif ($year) {
    $whereClause = " WHERE YEAR(fecha) = ? ";
    $types = "i";
    array_push($params, $year);
} else {
    echo json_encode(["success" => false, "message" => "Se requiere un filtro de fecha (año, mes o rango)."]);
    $conn->close();
    exit;
}

// --- Query 1: Totals and trend from 'bitacora_registros_diarios' ---
$trendData = [];
$totals = null;
$groupingUnit = ($year && $month) ? "DAY(fecha)" : (($startDate && $endDate) ? "fecha" : "MONTH(fecha)");

$sql1 = "SELECT 
            SUM(malware) as total_malware, SUM(phishing) as total_phishing,
            SUM(comando_y_control) as total_comando_y_control, SUM(criptomineria) as total_criptomineria,
            SUM(denegacion_de_servicios) as total_denegacion_de_servicios, SUM(intentos_de_conexion) as total_intentos_de_conexion,
            $groupingUnit as trend_unit 
        FROM `bitacora_registros_diarios` 
        $whereClause 
        GROUP BY trend_unit WITH ROLLUP";

$stmt1 = $conn->prepare($sql1);
if ($stmt1) {
    if (!empty($params)) $stmt1->bind_param($types, ...$params);
    $stmt1->execute();
    $result1 = $stmt1->get_result();
    while ($row = $result1->fetch_assoc()) {
        if ($row['trend_unit'] === null) $totals = $row;
        else $trendData[] = $row;
    }
    unset($totals['trend_unit']);
    $stmt1->close();
}

// --- Query 2: Actor summary from 'bitacora_amenazas' ---
$actorSummary = [];
$sql2 = "SELECT actor_amenaza, COUNT(*) as count 
         FROM `bitacora_amenazas` 
         $whereClause 
         GROUP BY actor_amenaza 
         HAVING actor_amenaza IS NOT NULL AND actor_amenaza != ''
         ORDER BY count DESC";

$stmt2 = $conn->prepare($sql2);
if ($stmt2) {
    if (!empty($params)) $stmt2->bind_param($types, ...$params);
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    while ($row = $result2->fetch_assoc()) {
        $actorSummary[] = ['actor' => $row['actor_amenaza'], 'count' => $row['count']];
    }
    $stmt2->close();
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