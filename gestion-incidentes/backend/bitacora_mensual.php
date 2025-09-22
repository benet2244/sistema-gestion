<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// Conexión a la base de datos
$servername = "localhost";
$username = "Gestion"; // <-- CAMBIAR A 'sistema_web'
$password = "";  // La contraseña por defecto en XAMPP suele ser vacía
$dbname = "gestion_incidentes";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos"]);
    exit;
}

// Meses en español
$meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Obtener parámetros GET
$mesInicio = isset($_GET['mesInicio']) ? $_GET['mesInicio'] : null;
$mesFin    = isset($_GET['mesFin']) ? $_GET['mesFin'] : null;
$year      = isset($_GET['year']) ? intval($_GET['year']) : null;

// Validación
if (!$mesInicio || !$mesFin || !$year) {
    echo json_encode(["success" => false, "message" => "Parámetros incompletos."]);
    exit;
}

$startIndex = array_search($mesInicio, $meses);
$endIndex   = array_search($mesFin, $meses);

if ($startIndex === false || $endIndex === false || $startIndex > $endIndex) {
    echo json_encode(["success" => false, "message" => "Rango de meses inválido."]);
    exit;
}

$all_data = [];

for ($i = $startIndex; $i <= $endIndex; $i++) {
    $currentMonthName = $meses[$i];
    $tableName = "bitacora_" . strtolower($currentMonthName) . "_" . $year;

    // Verificar que la tabla exista (case-insensitive)
    $checkTable = $conn->query("SHOW TABLES LIKE '" . $conn->real_escape_string($tableName) . "'");
    if ($checkTable->num_rows === 0) {
        continue; // No existe, pasamos al siguiente mes
    }

    $sql = "SELECT * FROM `$tableName` ORDER BY fecha DESC";
    $result = $conn->query($sql);

    $registros = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $registros[] = $row;
        }
    }

    $all_data[] = [
        "mes" => $currentMonthName,
        "registros" => $registros
    ];
}

if (count($all_data) > 0) {
    echo json_encode(["success" => true, "data" => $all_data]);
} else {
    echo json_encode(["success" => false, "message" => "No se encontraron datos en el rango seleccionado."]);
}

$conn->close();
