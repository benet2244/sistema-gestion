<?php
/**
 * @file reporte_bitacora_seguro.php
 * @brief Script de API para generar un reporte de bitácora de incidentes de seguridad.
 *
 * Este script se conecta a una base de datos MySQL, valida un rango de meses
 * proporcionado en la solicitud GET y consulta dinámicamente tablas con nombres
 * que siguen el patrón "bitacora_[mes]_[año]". Los resultados se devuelven en
 * formato JSON.
 *
 * Mejoras de seguridad y buenas prácticas:
 * - Se usan declaraciones preparadas para prevenir la inyección SQL en el futuro,
 * aunque la consulta actual no tiene parámetros directamente vulnerables.
 * - Se manejan los errores de conexión y de consulta de manera más robusta.
 * - El código está mejor organizado con una función principal.
 * - Se valida la entrada del usuario de manera más estricta.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Constantes para la configuración de la base de datos
$servername = "localhost";
$username = "Gestion"; // <-- CAMBIAR A 'sistema_web'
$password = "";// La contraseña por defecto en XAMPP suele ser vacía
$dbname = "gestion_incidentes";

/**
 * Mapeo de nombres de meses a números de mes.
 */
$meses = [
    'Enero' => 1, 'Febrero' => 2, 'Marzo' => 3, 'Abril' => 4, 'Mayo' => 5, 'Junio' => 6,
    'Julio' => 7, 'Agosto' => 8, 'Septiembre' => 9, 'Octubre' => 10, 'Noviembre' => 11, 'Diciembre' => 12
];

/**
 * Función principal para manejar la solicitud de API.
 */
function handleApiRequest($meses) {
    // Validar el método de solicitud
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método de solicitud no válido."]);
        return;
    }

    // Validar parámetros de entrada
    if (empty($_GET['mesInicio']) || empty($_GET['mesFin'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Por favor, selecciona un rango de meses."]);
        return;
    }

    $mesInicio = $_GET['mesInicio'];
    $mesFin = $_GET['mesFin'];
    $year = date("Y"); // Usamos el año actual

    // Verificar si los meses proporcionados son válidos
    if (!isset($meses[$mesInicio]) || !isset($meses[$mesFin])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Nombres de meses no válidos."]);
        return;
    }

    $startMonth = $meses[$mesInicio];
    $endMonth = $meses[$mesFin];

    // Conexión a la base de datos
    $conn = new mysqli(SERVERNAME, USERNAME, PASSWORD, DBNAME);
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
    }

    $reporte_data = [];
    $total_registros_encontrados = 0;

    // Iterar sobre los meses en el rango
    foreach ($meses as $nombreMes => $numeroMes) {
        if ($numeroMes >= $startMonth && $numeroMes <= $endMonth) {
            $table_name = "bitacora_" . strtolower($nombreMes) . "_" . $year;

            // Verificar si la tabla existe antes de consultarla (opcional pero recomendado)
            $tableExists = $conn->query("SHOW TABLES LIKE '{$table_name}'");
            if ($tableExists->num_rows == 0) {
                // Si la tabla no existe, simplemente saltar a la siguiente iteración
                continue;
            }

            // Usamos una declaración preparada. Aunque la consulta no tiene variables,
            // es una buena práctica para escalabilidad y seguridad.
            $sql = "SELECT dia, malwares, phising, otros FROM `" . $table_name . "` ORDER BY dia ASC";
            $stmt = $conn->prepare($sql);
            
            if ($stmt === false) {
                // Manejar error de preparación de la consulta
                continue;
            }
            
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $registros_mes = [];
                while ($row = $result->fetch_assoc()) {
                    $registros_mes[] = $row;
                }
                $reporte_data[] = ["mes" => $nombreMes, "registros" => $registros_mes];
                $total_registros_encontrados += $result->num_rows;
            }
            $stmt->close();
        }
    }

    $conn->close();

    echo json_encode([
        "success" => true,
        "message" => "Reporte generado con éxito.",
        "total_registros" => $total_registros_encontrados,
        "data" => $reporte_data
    ]);
}

// Ejecutar la lógica principal
handleApiRequest($meses);
?>
