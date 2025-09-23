<?php
// Guardián de seguridad: verifica si el usuario ha iniciado sesión.
require_once 'session_secure.php';
// Incluir el archivo de configuración de la base de datos
require_once 'config.php';

// Cabeceras estándar para la API
// header('Access-Control-Allow-Origin: *'); // Reemplazado por el guardián
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Manejar la solicitud de "pre-vuelo" (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Obtener un solo incidente
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT * FROM incidentes WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                echo json_encode($result->fetch_assoc());
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Incidente no encontrado."]);
            }
            $stmt->close();
        } else {
            // Obtener todos los incidentes
            $sql = "SELECT * FROM incidentes ORDER BY fecha_creacion DESC";
            $result = $conn->query($sql);
            $incidents = $result->fetch_all(MYSQLI_ASSOC);
            echo json_encode($incidents);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        // Validar datos de entrada
        if (!isset($data->tipo_incidente, $data->prioridad, $data->fecha_incidente, $data->responsable, $data->equipo_afectado, $data->direccion_mac, $data->dependencia, $data->acciones_tomadas)) {
            http_response_code(400);
            echo json_encode(["message" => "Datos incompletos para el registro."]);
            break;
        }

        $sql = "INSERT INTO incidentes (tipo_incidente, prioridad, fecha_incidente, responsable, equipo_afectado, direccion_mac, dependencia, cantidad_detecciones, estado_equipo, acciones_tomadas, hash_url, nivel_amenaza, detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        // Asignar valores nulos si no están definidos
        $cantidad_detecciones = isset($data->cantidad_detecciones) ? $data->cantidad_detecciones : null;
        $estado_equipo = isset($data->estado_equipo) ? $data->estado_equipo : null;
        $hash_url = isset($data->hash_url) ? $data->hash_url : null;
        $nivel_amenaza = isset($data->nivel_amenaza) ? $data->nivel_amenaza : null;
        $detalles = isset($data->detalles) ? $data->detalles : null;

        $stmt->bind_param("sssssssssssss", 
            $data->tipo_incidente, $data->prioridad, $data->fecha_incidente, $data->responsable, 
            $data->equipo_afectado, $data->direccion_mac, $data->dependencia, 
            $cantidad_detecciones, $estado_equipo, $data->acciones_tomadas, 
            $hash_url, $nivel_amenaza, $detalles
        );

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Nuevo incidente registrado con éxito.", "id" => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error al registrar el incidente: " . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $data = json_decode(file_get_contents("php://input"));

        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "ID del incidente no proporcionado."]);
            break;
        }

        $sql = "UPDATE incidentes SET tipo_incidente=?, prioridad=?, fecha_incidente=?, responsable=?, equipo_afectado=?, direccion_mac=?, dependencia=?, cantidad_detecciones=?, estado_equipo=?, acciones_tomadas=?, hash_url=?, nivel_amenaza=?, detalles=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        
        $cantidad_detecciones = isset($data->cantidad_detecciones) ? $data->cantidad_detecciones : null;
        $estado_equipo = isset($data->estado_equipo) ? $data->estado_equipo : null;
        $acciones_tomadas = isset($data->acciones_tomadas) ? $data->acciones_tomadas : null;
        $hash_url = isset($data->hash_url) ? $data->hash_url : null;
        $nivel_amenaza = isset($data->nivel_amenaza) ? $data->nivel_amenaza : null;
        $detalles = isset($data->detalles) ? $data->detalles : null;

        $stmt->bind_param("sssssssssssssi", 
            $data->tipo_incidente, $data->prioridad, $data->fecha_incidente, $data->responsable, 
            $data->equipo_afectado, $data->direccion_mac, $data->dependencia, 
            $cantidad_detecciones, $estado_equipo, $acciones_tomadas, 
            $hash_url, $nivel_amenaza, $detalles, $id
        );

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["message" => "Incidente actualizado con éxito."]);
            } else {
                echo json_encode(["message" => "No se encontró el incidente o no hubo cambios que aplicar."]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error al actualizar el incidente: " . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "ID de incidente no proporcionado."]);
            exit();
        }
        $id = $_GET['id'];

        $stmt = $conn->prepare("DELETE FROM incidentes WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["message" => "Incidente eliminado con éxito."]);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Incidente no encontrado."]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error al eliminar el incidente: " . $stmt->error]);
        }
        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Método no permitido."]);
        break;
}

$conn->close();
?>