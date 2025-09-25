<?php
header("Access-Control-Allow-Origin: http://localhost:3001");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(["success" => false, "message" => "Error de conexión con la base de datos."]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"));

function validate_data($data) {
    return !empty($data->tipo_incidente) && !empty($data->fecha_incidente) && !empty($data->responsable);
}

switch ($method) {
    case 'POST': // Crear nuevo incidente
        if (!validate_data($data)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos incompletos. Por favor, complete los campos requeridos."]);
            break;
        }

        $query = "INSERT INTO detecciones (hostname, source_ip, target_ip, detection_description, severity, estado, tipo_incidente, fecha_incidente, responsable, equipo_afectado, direccion_mac, dependencia, cantidad_detecciones, estado_equipo, acciones_tomadas, hash_url, nivel_amenaza, detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);

        // CORREGIDO: Se ajustó el string de tipos de `bind_param`
        // El tipo para `dependencia` es `s` (string) y para `cantidad_detecciones` es `i` (integer)
        $stmt->bind_param(
            "ssssssssssssisssss",
            $data->hostname ?? null,
            $data->source_ip ?? null,
            $data->target_ip ?? null,
            $data->detection_description ?? null,
            $data->severity ?? 'Media',
            $data->estado ?? 'Nuevo',
            $data->tipo_incidente,
            $data->fecha_incidente,
            $data->responsable,
            $data->equipo_afectado ?? null,
            $data->direccion_mac ?? null,
            $data->dependencia ?? null,
            $data->cantidad_detecciones ?? 0,
            $data->estado_equipo ?? null,
            $data->acciones_tomadas ?? null,
            $data->hash_url ?? null,
            $data->nivel_amenaza ?? null,
            $data->detalles ?? null
        );

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Incidente registrado con éxito."]);
        } else {
            http_response_code(503);
            echo json_encode(["success" => false, "message" => "No se pudo registrar el incidente: " . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PUT': // Actualizar incidente existente
        $id = isset($_GET['id']) ? $_GET['id'] : die();

        if (!validate_data($data)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos incompletos para actualizar."]);
            break;
        }

        $query = "UPDATE detecciones SET hostname=?, source_ip=?, target_ip=?, detection_description=?, severity=?, estado=?, tipo_incidente=?, fecha_incidente=?, responsable=?, equipo_afectado=?, direccion_mac=?, dependencia=?, cantidad_detecciones=?, estado_equipo=?, acciones_tomadas=?, hash_url=?, nivel_amenaza=?, detalles=? WHERE id_deteccion = ?";
        $stmt = $db->prepare($query);

        // CORREGIDO: Se ajustó el string de tipos también para la actualización
        $stmt->bind_param(
            "ssssssssssssisssssi",
            $data->hostname ?? null,
            $data->source_ip ?? null,
            $data->target_ip ?? null,
            $data->detection_description ?? null,
            $data->severity ?? 'Media',
            $data->estado ?? 'Nuevo',
            $data->tipo_incidente,
            $data->fecha_incidente,
            $data->responsable,
            $data->equipo_afectado ?? null,
            $data->direccion_mac ?? null,
            $data->dependencia ?? null,
            $data->cantidad_detecciones ?? 0,
            $data->estado_equipo ?? null,
            $data->acciones_tomadas ?? null,
            $data->hash_url ?? null,
            $data->nivel_amenaza ?? null,
            $data->detalles ?? null,
            $id
        );

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["success" => true, "message" => "Incidente actualizado con éxito."]);
        } else {
            http_response_code(503);
            echo json_encode(["success" => false, "message" => "No se pudo actualizar el incidente: " . $stmt->error]);
        }
        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido."]);
        break;
}

$db->close();
?>