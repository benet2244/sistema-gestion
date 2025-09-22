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
echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos: " . $conn->connect_error]);
exit;
}

// Meses en español
$meses = [
	"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
	"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Obtener parámetros GET y usar el operador ?? para evitar advertencias de "Undefined array key"
$mesInicio = $_GET['mesInicio'] ?? null;
$mesFin = $_GET['mesFin'] ?? null;
$year = $_GET['year'] ?? null;

// Validación de parámetros
if (!$mesInicio || !$mesFin || !$year) {
echo json_encode(["success" => false, "message" => "Parámetros incompletos. Por favor, selecciona un rango de meses y un año."]);
exit;
}

$startIndex = array_search($mesInicio, $meses);
$endIndex = array_search($mesFin, $meses);

if ($startIndex === false || $endIndex === false || $startIndex > $endIndex) {
echo json_encode(["success" => false, "message" => "Rango de meses inválido. Asegúrate de que los nombres de los meses sean correctos y el rango sea válido."]);
exit;
}

$all_data = [];

for ($i = $startIndex; $i <= $endIndex; $i++) {
$currentMonthName = $meses[$i];
// Sanitizar el nombre de la tabla para prevenir inyecciones SQL
$tableName = $conn->real_escape_string("bitacora_" . strtolower($currentMonthName) . "_" . $year);

$registros = [];

// Verificar que la tabla exista
$checkTable = $conn->query("SHOW TABLES LIKE '$tableName'");
if ($checkTable && $checkTable->num_rows > 0) {
	$sql = "SELECT * FROM `$tableName` ORDER BY fecha DESC";
	$result = $conn->query($sql);

	if ($result && $result->num_rows > 0) {
		while ($row = $result->fetch_assoc()) {
			$registros[] = $row;
		}
	}
}

// Agregamos el mes aunque no tenga registros
$all_data[] = [
	"mes" => $currentMonthName,
	"registros" => $registros
];
}

echo json_encode(["success" => true, "data" => $all_data], JSON_UNESCAPED_UNICODE);

$conn->close();