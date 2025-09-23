<?php
// Incluir el archivo de configuración de la base de datos
require_once 'config.php';

// Cabeceras estándar para la API
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Manejar la solicitud de "pre-vuelo" (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Lógica de Filtros ---
$mesInicioStr = $_GET['mesInicio'] ?? '';
$mesFinStr = $_GET['mesFin'] ?? '';
$year = $_GET['year'] ?? date('Y');

$meses_map_nombre_a_num = [
    'Enero' => 1, 'Febrero' => 2, 'Marzo' => 3, 'Abril' => 4, 'Mayo' => 5, 'Junio' => 6,
    'Julio' => 7, 'Agosto' => 8, 'Septiembre' => 9, 'Octubre' => 10, 'Noviembre' => 11, 'Diciembre' => 12
];

if (empty($mesInicioStr) || empty($mesFinStr) || empty($year) || !isset($meses_map_nombre_a_num[$mesInicioStr]) || !isset($meses_map_nombre_a_num[$mesFinStr])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Parámetros 'mesInicio', 'mesFin', y 'year' son requeridos y deben ser válidos."]);
    $conn->close();
    exit();
}

$mesInicioNum = $meses_map_nombre_a_num[$mesInicioStr];
$mesFinNum = $meses_map_nombre_a_num[$mesFinStr];

// Asegurarse de que el rango de fechas sea lógico
if ($mesInicioNum > $mesFinNum) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "El mes de inicio no puede ser posterior al mes de fin."]);
    $conn->close();
    exit();
}

$startDate = date("Y-m-d", mktime(0, 0, 0, $mesInicioNum, 1, $year));
$endDate = date("Y-m-t", mktime(0, 0, 0, $mesFinNum, 1, $year));

// --- Consulta a la Base de Datos con Sentencia Preparada ---
$sql = "SELECT MONTH(fecha) as mes_num, fecha, malware, phishing, comando_y_control, criptomineria, denegacion_de_servicios, intentos_de_conexion FROM bitacora_registros_diarios WHERE fecha BETWEEN ? AND ? ORDER BY fecha ASC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "Error al preparar la consulta: " . $conn->error]));
}

$stmt->bind_param("ss", $startDate, $endDate);
$stmt->execute();
$result = $stmt->get_result();

// --- Procesamiento de Datos ---
$data = [];
$meses_map_num_a_nombre = [
    1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril', 5 => 'Mayo', 6 => 'Junio',
    7 => 'Julio', 8 => 'Agosto', 9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
];

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

$stmt->close();
$conn->close();

// --- Respuesta Final ---
if (empty($data)) {
    echo json_encode(["success" => true, "message" => "No se encontraron datos para el período seleccionado.", "data" => []]);
} else {
    echo json_encode(["success" => true, "data" => array_values($data)]);
}
?>