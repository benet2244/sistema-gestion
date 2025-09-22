<?php
// Incluir el archivo de configuración de la base de datos
require_once 'config.php';

// Lógica para generar reportes
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener los parámetros de fecha de la URL
    $fecha_inicio = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $fecha_fin = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    $tipo_incidente = isset($_GET['tipo_incidente']) ? $_GET['tipo_incidente'] : null;

    $sql = "SELECT * FROM incidentes";
    $conditions = [];

    // Construir la consulta SQL con los parámetros de fecha
    if ($fecha_inicio && $fecha_fin) {
        $conditions[] = "fecha_incidente BETWEEN '{$conn->real_escape_string($fecha_inicio)}' AND '{$conn->real_escape_string($fecha_fin)}'";
    } elseif ($fecha_inicio) {
        $conditions[] = "fecha_incidente >= '{$conn->real_escape_string($fecha_inicio)}'";
    } elseif ($fecha_fin) {
        $conditions[] = "fecha_incidente <= '{$conn->real_escape_string($fecha_fin)}'";
    }

    // Agregar la condición para el tipo de incidente si está presente
    if ($tipo_incidente) {
        $conditions[] = "tipo_incidente = '{$conn->real_escape_string($tipo_incidente)}'";
    }

    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(' AND ', $conditions);
    }

    $sql .= " ORDER BY fecha_creacion DESC";

    $result = $conn->query($sql);
    $reports = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }
    }
    echo json_encode($reports);

} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode(["message" => "Método no permitido."]);
}

$conn->close();
?>