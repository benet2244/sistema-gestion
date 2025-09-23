<?php
// Incluir el archivo de configuración de la base de datos
require_once 'config.php';

// Cabeceras estándar para la API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejo de la solicitud pre-flight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}

// === Manejo de la Solicitud POST ===
handlePostRequest($conn);

$conn->close();

function handlePostRequest($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido."]);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Error en el JSON recibido."]);
        return;
    }

    $title = $data['title'] ?? 'Amenaza Sin Título';
    $status = $data['status'] ?? 'Abierto';
    $lead_investigator = $data['lead_investigator'] ?? 'No asignado';

    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("INSERT INTO amenaza (title, status, lead_investigator) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $title, $status, $lead_investigator);
        $stmt->execute();
        $amenaza_id = $conn->insert_id;
        $stmt->close();

        $sectionMapping = [
            'cronologia' => ['handler' => 'handleTimelineEvents'],
            'sistemas' => ['handler' => 'handleAsset', 'type' => 'Sistema'],
            'cuentas' => ['handler' => 'handleAsset', 'type' => 'Cuenta'],
            'aplicaciones' => ['handler' => 'handleAsset', 'type' => 'Aplicacion'],
            'indicadoresHost' => ['handler' => 'handleIndicator', 'type' => 'Host'],
            'indicadoresRed' => ['handler' => 'handleIndicator', 'type' => 'Red'],
            'palabrasClave' => ['handler' => 'handleIndicator', 'type' => 'Keyword'],
            'rastreadorFlujo' => ['handler' => 'handleLog', 'type' => 'Rastreador de Flujo'],
            'listaControl' => ['handler' => 'handleLog', 'type' => 'Lista de Control'],
            'notasInvestigacion' => ['handler' => 'handleLog', 'type' => 'Notas de Investigacion'],
            'inteligencia' => ['handler' => 'handleLog', 'type' => 'Inteligencia - RFI'],
            'evidencia' => ['handler' => 'handleLog', 'type' => 'Rastreador de Evidencia'],
            'consultas' => ['handler' => 'handleLog', 'type' => 'Consulta de Investigacion'],
            'asignacionFlujo' => ['handler' => 'handleAssignment']
        ];
        
        foreach ($data['formData'] as $key => $rows) {
            if (isset($sectionMapping[$key]) && is_array($rows)) {
                $mapping = $sectionMapping[$key];
                $handler = $mapping['handler'];
                foreach ($rows as $row) {
                    if (!empty(array_filter($row, fn($value) => $value !== ''))) { // Solo procesar si la fila tiene datos
                        call_user_func($handler, $conn, $amenaza_id, $row, $mapping);
                    }
                }
            }
        }

        $conn->commit();
        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Amenaza guardada con éxito.", "amenaza_id" => $amenaza_id]);

    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al guardar los datos: " . $e->getMessage()]);
    }
}

function handleTimelineEvents($conn, $amenaza_id, $row, $mapping) {
    $stmt = $conn->prepare("INSERT INTO timeline_events (amenaza_id, event_time, activity, submitted_by, source_ip, destination_ip, system_name, user_account, details, attack_mapping) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $event_time = !empty($row['fecha/hora (UTC)']) ? date('Y-m-d H:i:s', strtotime($row['fecha/hora (UTC)'])) : null;
    $stmt->bind_param("isssssssss", $amenaza_id, $event_time, $row['actividad'], $row['enviado por'], $row['ip de origen'], $row['ip de destino'], $row['nombre del sistema'], $row['usuario/cuenta'], $row['detalles/comentarios'], $row['mapeo a att&ck']);
    $stmt->execute();
    $stmt->close();
}

function handleAsset($conn, $amenaza_id, $row, $mapping) {
    $asset_type = $mapping['type'];
    $name = $row['nombre de host'] ?? $row['nombre de la cuenta'] ?? $row['Nombre de la aplicación'] ?? 'Nombre no especificado';
    $status = $row['estado'] ?? '';
    $details = json_encode($row);
    $stmt = $conn->prepare("INSERT INTO affected_assets (amenaza_id, asset_type, name, status, details) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issss", $amenaza_id, $asset_type, $name, $status, $details);
    $stmt->execute();
    $stmt->close();
}

function handleIndicator($conn, $amenaza_id, $row, $mapping) {
    $indicator_type = $mapping['type'];
    $value = $row['indicador'] ?? $row['Palabras clave forenses de alta fidelidad'] ?? 'Valor no especificado';
    $description = $row['descripción compleja o nombre'] ?? $row['detalles/comentarios'] ?? '';
    $details = json_encode($row);
    $stmt = $conn->prepare("INSERT INTO indicators (amenaza_id, indicator_type, value, description, details) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issss", $amenaza_id, $indicator_type, $value, $description, $details);
    $stmt->execute();
    $stmt->close();
}

function handleLog($conn, $amenaza_id, $row, $mapping) {
    $log_category = $mapping['type'];
    $notes = $row['notas'] ?? $row['solicitud de información'] ?? $row['Consulta'] ?? json_encode($row);
    $submitted_by = $row['enviado por'] ?? '';
    $stmt = $conn->prepare("INSERT INTO investigation_logs (amenaza_id, log_category, submitted_by, notes) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $amenaza_id, $log_category, $submitted_by, $notes);
    $stmt->execute();
    $stmt->close();
}

function handleAssignment($conn, $amenaza_id, $row, $mapping) {
    $workflow_name = $row['flujo de trabajo'];
    foreach($row as $role => $name) {
        if ($role !== 'flujo de trabajo' && !empty($name)) {
            $assignee_role = ($role === 'dirigir') ? 'Lider' : 'Respondedor';
            $stmt = $conn->prepare("INSERT INTO workflow_assignments (amenaza_id, workflow_name, assignee_name, assignee_role) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("isss", $amenaza_id, $workflow_name, $name, $assignee_role);
            $stmt->execute();
            $stmt->close();
        }
    }
}
?>