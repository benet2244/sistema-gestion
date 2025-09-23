<?php
// Headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// --- Database Connection ---
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "gestion_incidentes";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos: " . $conn->connect_error]);
    exit;
}

// --- Request Method Routing ---
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    handleGet($conn);
} elseif ($method == 'POST') {
    handlePost($conn);
} else {
    http_response_code(200);
}

// --- GET Logic: Fetch monthly data from a single table ---
function handleGet($conn) {
    $mes  = isset($_GET['mes']) ? $_GET['mes'] : null;
    $year = isset($_GET['year']) ? intval($_GET['year']) : null;

    if (!$mes || !$year) {
        echo json_encode(["success" => false, "message" => "Parámetros 'mes' y 'año' son requeridos."]);
        exit;
    }

    $meses_es = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    $month_num = array_search($mes, $meses_es) + 1;

    if ($month_num === 0) {
        echo json_encode(["success" => false, "message" => "Nombre de mes inválido."]);
        exit;
    }

    $tableName = "bitacora_registros_diarios"; // The one and only table

    $sql = "SELECT * FROM `$tableName` WHERE YEAR(fecha) = ? AND MONTH(fecha) = ? ORDER BY fecha ASC";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Error al preparar la consulta: " . $conn->error]);
        exit;
    }
    
    $stmt->bind_param("ii", $year, $month_num);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $registros = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $registros[] = $row;
        }
    }
    $stmt->close();

    echo json_encode(["success" => true, "registros" => $registros]);
}

// --- POST Logic: Save monthly data to a single table ---
function handlePost($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    $registros = isset($data['registros']) ? $data['registros'] : null;

    if (!$registros) {
        echo json_encode(["success" => false, "message" => "Datos de registros incompletos para guardar."]);
        exit;
    }

    $tableName = "bitacora_registros_diarios"; // The one and only table

    $sql = "
    INSERT INTO `$tableName` (fecha, malware, phishing, comando_y_control, criptomineria, denegacion_de_servicios, intentos_de_conexion)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      malware = VALUES(malware),
      phishing = VALUES(phishing),
      comando_y_control = VALUES(comando_y_control),
      criptomineria = VALUES(criptomineria),
      denegacion_de_servicios = VALUES(denegacion_de_servicios),
      intentos_de_conexion = VALUES(intentos_de_conexion)
    ";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Error al preparar la consulta: " . $conn->error]);
        exit;
    }
    
    $conn->begin_transaction();

    foreach ($registros as $registro) {
        // Skip saving if all threat counts are zero
        if ($registro['malware'] == 0 && $registro['phishing'] == 0 && $registro['comando_y_control'] == 0 && $registro['criptomineria'] == 0 && $registro['denegacion_de_servicios'] == 0 && $registro['intentos_de_conexion'] == 0) {
            continue;
        }

        $stmt->bind_param("siiiiii",
            $registro['fecha'],
            $registro['malware'],
            $registro['phishing'],
            $registro['comando_y_control'],
            $registro['criptomineria'],
            $registro['denegacion_de_servicios'],
            $registro['intentos_de_conexion']
        );
        
        if (!$stmt->execute()) {
             $conn->rollback();
             echo json_encode(["success" => false, "message" => "Error al guardar el registro para la fecha " . $registro['fecha'] . ": " . $stmt->error]);
             $stmt->close();
             $conn->close();
             exit;
        }
    }

    $conn->commit();
    $stmt->close();

    echo json_encode(["success" => true, "message" => "Bitácora guardada correctamente."]);
}

$conn->close();
?>
