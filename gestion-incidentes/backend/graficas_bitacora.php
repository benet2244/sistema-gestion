<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "Gestion"; // <-- CAMBIAR A 'sistema_web'
$password = ""; // La contraseña por defecto en XAMPP suele ser vacía
$dbname = "gestion_incidentes";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

$meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $mesInicio = isset($_GET['mesInicio']) ? $_GET['mesInicio'] : '';
    $mesFin = isset($_GET['mesFin']) ? $_GET['mesFin'] : '';
    $year = date("Y"); 

    if (empty($mesInicio) || empty($mesFin)) {
        echo json_encode(["success" => false, "message" => "Mes de inicio y fin son requeridos."]);
        $conn->close();
        exit();
    }

    $mesInicioIndex = array_search($mesInicio, $meses);
    $mesFinIndex = array_search($mesFin, $meses);

    if ($mesInicioIndex === false || $mesFinIndex === false) {
        echo json_encode(["success" => false, "message" => "Mes(es) no válido(s)."]);
        $conn->close();
        exit();
    }

    $data = [];
    for ($i = $mesInicioIndex; $i <= $mesFinIndex; $i++) {
        $mes = $meses[$i];
        $table_name = "bitacora_" . $mes . "_" . $year;

        $check_table = $conn->query("SHOW TABLES LIKE '$table_name'");
        if ($check_table->num_rows > 0) {
            $sql = "SELECT fecha, malware, phishing, comando_y_control, criptomineria, denegacion_de_servicios, intentos_de_conexion FROM `$table_name` ORDER BY fecha ASC";
            $result = $conn->query($sql);
            
            $registros = [];
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $registros[] = $row;
                }
            }
            
            $data[] = [
                "mes" => $mes,
                "registros" => $registros
            ];
        }
    }

    echo json_encode($data);

} else {
    echo json_encode(["success" => false, "message" => "Método de solicitud no válido."]);
}

$conn->close();
?>
