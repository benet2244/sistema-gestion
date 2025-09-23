<?php
ini_set('display_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "Gestion";
$password = "";
$dbname = "gestion_incidentes";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "Error de conexión a la base de datos: " . $conn->connect_error]));
}

$mesInicioStr = $_GET['mesInicio'] ?? '';
$mesFinStr = $_GET['mesFin'] ?? '';
$year = $_GET['year'] ?? date('Y');

$meses_map_nombre_a_num = [
    'Enero' => 1, 'Febrero' => 2, 'Marzo' => 3, 'Abril' => 4, 'Mayo' => 5, 'Junio' => 6,
    'Julio' => 7, 'Agosto' => 8, 'Septiembre' => 9, 'Octubre' => 10, 'Noviembre' => 11, 'Diciembre' => 12
];

if (empty($mesInicioStr) || empty($mesFinStr) || empty($year) || !isset($meses_map_nombre_a_num[$mesInicioStr]) || !isset($meses_map_nombre_a_num[$mesFinStr])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Parámetros insuficientes o inválidos."]);
    $conn->close();
    exit();
}

$mesInicioNum = $meses_map_nombre_a_num[$mesInicioStr];
$mesFinNum = $meses_map_nombre_a_num[$mesFinStr];

$startDate = date("Y-m-d", mktime(0, 0, 0, $mesInicioNum, 1, $year));
$endDate = date("Y-m-t", mktime(0, 0, 0, $mesFinNum, 1, $year));

$meses_map_num_a_nombre = [
    1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril', 5 => 'Mayo', 6 => 'Junio',
    7 => 'Julio', 8 => 'Agosto', 9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
];

// === CORRECCIÓN FINALÍSIMA: Usar el nombre de tabla 'bitacora_registros_diarios' ===
$sql = sprintf(
    "SELECT MONTH(fecha) as mes_num, malware, phishing, comando_y_control, criptomineria, denegacion_de_servicios, intentos_de_conexion FROM bitacora_registros_diarios WHERE fecha BETWEEN '%s' AND '%s' ORDER BY fecha ASC",
    $conn->real_escape_string($startDate),
    $conn->real_escape_string($endDate)
);

$result = $conn->query($sql);

$data = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $mes_num = $row['mes_num'];
        $mes_final = $meses_map_num_a_nombre[$mes_num] ?? 'Mes Desconocido';
        
        if (!isset($data[$mes_final])) {
            $data[$mes_final] = [
                "mes" => $mes_final,
                "registros" => []
            ];
        }
        $data[$mes_final]["registros"][] = $row;
    }
}

$conn->close();

if (empty($data)) {
    echo json_encode(["success" => false, "message" => "No se encontraron datos para el período seleccionado.", "data" => []]);
} else {
    echo json_encode(["success" => true, "data" => array_values($data)]);
}

?>