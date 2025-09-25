<?php
// backend/obtener_amenazas.php

header("Access-Control-Allow-Origin: *");
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

// --- CONFIGURACIÓN DE FECHA ---
// Si no se especifica mes/año, se usa el mes y año actual.
$month = isset($_GET['month']) ? (int)$_GET['month'] : date('m');
$year = isset($_GET['year']) ? (int)$_GET['year'] : date('Y');

$response_data = [];

// --- CONSULTA 1: DATOS PARA LA TABLA DE AMENAZAS DIARIAS ---
$query_registros = "SELECT * FROM amenazas_diarias WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?";
$stmt_registros = $db->prepare($query_registros);
$stmt_registros->bind_param("ii", $month, $year);
$stmt_registros->execute();
$result_registros = $stmt_registros->get_result();

$datos_existentes = [];
while ($row = $result_registros->fetch_assoc()) {
    $datos_existentes[$row['fecha']] = $row;
}
$stmt_registros->close();

$registros = [];
$dias_en_mes = cal_days_in_month(CAL_GREGORIAN, $month, $year);
for ($d = 1; $d <= $dias_en_mes; $d++) {
    $fecha_actual = sprintf('%d-%02d-%02d', $year, $month, $d);
    if (isset($datos_existentes[$fecha_actual])) {
        $registros[] = $datos_existentes[$fecha_actual];
    } else {
        $registros[] = [
            "id" => null,
            "fecha" => $fecha_actual,
            "malware" => 0,
            "phishing" => 0,
            "comando_y_control" => 0,
            "criptomineria" => 0,
            "denegacion_de_servicios" => 0,
            "intentos_conexion_bloqueados" => 0,
        ];
    }
}
$response_data['registros'] = $registros;


// --- CONSULTA 2: RESUMEN DE TOTALES PARA EL GRÁFICO DE BARRAS ---
// Suma de cada tipo de amenaza para el mes y año seleccionados.
$query_totales = "
    SELECT
        SUM(malware) as Malware,
        SUM(phishing) as Phishing,
        SUM(comando_y_control) as 'Comando y Control',
        SUM(criptomineria) as Criptominería,
        SUM(denegacion_de_servicios) as 'Denegación de Servicios',
        SUM(intentos_conexion_bloqueados) as 'Conexiones Bloqueadas'
    FROM amenazas_diarias
    WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?;
";
$stmt_totales = $db->prepare($query_totales);
$stmt_totales->bind_param("ii", $month, $year);
$stmt_totales->execute();
$result_totales = $stmt_totales->get_result();
$totales = $result_totales->fetch_assoc();
$stmt_totales->close();

// Formateo para el gráfico de barras (Chart.js)
$threatsBySubclass = [];
if ($totales) {
    foreach ($totales as $name => $value) {
        $threatsBySubclass[] = ['name' => $name, 'value' => (int)$value];
    }
}
$response_data['threatsBySubclass'] = $threatsBySubclass;


// --- CONSULTA 3: EVOLUCIÓN MENSUAL PARA EL GRÁFICO DE LÍNEAS ---
// Total de amenazas por mes, para mostrar la tendencia.
$query_tendencia = "
    SELECT 
        YEAR(fecha) AS anio,
        MONTH(fecha) AS mes_num,
        SUM(malware + phishing + comando_y_control + criptomineria + denegacion_de_servicios + intentos_conexion_bloqueados) AS total_amenazas
    FROM amenazas_diarias
    GROUP BY anio, mes_num
    ORDER BY anio, mes_num;
";
$stmt_tendencia = $db->prepare($query_tendencia);
$stmt_tendencia->execute();
$result_tendencia = $stmt_tendencia->get_result();
$tendencia = [];
while ($row = $result_tendencia->fetch_assoc()) {
    $tendencia[] = $row;
}
$response_data['threatsPerMonth'] = $tendencia;
$stmt_tendencia->close();


// --- RESPUESTA FINAL ---
http_response_code(200);
echo json_encode($response_data);

$db->close();
?>
