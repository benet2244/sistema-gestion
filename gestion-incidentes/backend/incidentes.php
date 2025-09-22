<?php
// Incluir el archivo de configuración de la base de datos
require_once 'config.php';

// Establecer cabeceras para permitir peticiones desde el frontend de React (CORS)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Manejar la solicitud de "pre-vuelo" (preflight request) de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Lógica de enrutamiento basada en el método de solicitud
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Lógica para obtener incidentes
        $id = isset($_GET['id']) ? $conn->real_escape_string($_GET['id']) : null;
        
        if ($id) {
            // Si se proporciona un ID, obtiene un solo incidente
            $sql = "SELECT * FROM incidentes WHERE id = $id";
            $result = $conn->query($sql);
            if ($result->num_rows > 0) {
                echo json_encode($result->fetch_assoc());
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Incidente no encontrado."]);
            }
        } else {
            // Si no se proporciona un ID, obtiene todos los incidentes
            $sql = "SELECT * FROM incidentes ORDER BY fecha_creacion DESC";
            $result = $conn->query($sql);

            $incidents = [];
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $incidents[] = $row;
                }
            }
            echo json_encode($incidents);
        }
        break;

    case 'POST':
        // Lógica para registrar un nuevo incidente
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->tipo_incidente, $data->prioridad, $data->fecha_incidente, $data->responsable, $data->equipo_afectado, $data->direccion_mac, $data->dependencia, $data->acciones_tomadas)) {
            http_response_code(400);
            echo json_encode(["message" => "Datos incompletos para el registro."]);
            break;
        }

        $tipo_incidente = $conn->real_escape_string($data->tipo_incidente);
        $prioridad = $conn->real_escape_string($data->prioridad);
        $fecha_incidente = $conn->real_escape_string($data->fecha_incidente);
        $responsable = $conn->real_escape_string($data->responsable);
        $equipo_afectado = $conn->real_escape_string($data->equipo_afectado);
        $direccion_mac = $conn->real_escape_string($data->direccion_mac);
        $dependencia = $conn->real_escape_string($data->dependencia);
        $cantidad_detecciones = isset($data->cantidad_detecciones) ? $conn->real_escape_string($data->cantidad_detecciones) : null;
        $estado_equipo = isset($data->estado_equipo) ? $conn->real_escape_string($data->estado_equipo) : null;
        $acciones_tomadas = $conn->real_escape_string($data->acciones_tomadas);
        $hash_url = isset($data->hash_url) ? $conn->real_escape_string($data->hash_url) : null;
        $nivel_amenaza = isset($data->nivel_amenaza) ? $conn->real_escape_string($data->nivel_amenaza) : null;
        $detalles = isset($data->detalles) ? $conn->real_escape_string($data->detalles) : null;

        $sql = "INSERT INTO incidentes (tipo_incidente, prioridad, fecha_incidente, responsable, equipo_afectado, direccion_mac, dependencia, cantidad_detecciones, estado_equipo, acciones_tomadas, hash_url, nivel_amenaza, detalles) 
                VALUES ('$tipo_incidente', '$prioridad', '$fecha_incidente', '$responsable', '$equipo_afectado', '$direccion_mac', '$dependencia', '$cantidad_detecciones', '$estado_equipo', '$acciones_tomadas', '$hash_url', '$nivel_amenaza', '$detalles')";
        
        if ($conn->query($sql) === TRUE) {
            http_response_code(201); // Created
            echo json_encode(["message" => "Nuevo incidente registrado con éxito.", "id" => $conn->insert_id]);
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(["message" => "Error al registrar el incidente: " . $conn->error]);
        }
        break;

    case 'PUT':
        // Lógica para actualizar un incidente existente
        $id = isset($_GET['id']) ? $conn->real_escape_string($_GET['id']) : null;
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$id) {
            http_response_code(400); // Bad Request
            echo json_encode(["message" => "ID del incidente no proporcionado."]);
            break;
        }

        $tipo_incidente = $conn->real_escape_string($data['tipo_incidente']);
        $prioridad = $conn->real_escape_string($data['prioridad']);
        $fecha_incidente = $conn->real_escape_string($data['fecha_incidente']);
        $responsable = $conn->real_escape_string($data['responsable']);
        $equipo_afectado = $conn->real_escape_string($data['equipo_afectado']);
        $direccion_mac = $conn->real_escape_string($data['direccion_mac']);
        $dependencia = $conn->real_escape_string($data['dependencia']);
        $cantidad_detecciones = isset($data['cantidad_detecciones']) ? $conn->real_escape_string($data['cantidad_detecciones']) : null;
        $estado_equipo = isset($data['estado_equipo']) ? $conn->real_escape_string($data['estado_equipo']) : null;
        $acciones_tomadas = isset($data['acciones_tomadas']) ? $conn->real_escape_string($data['acciones_tomadas']) : null;
        $hash_url = isset($data['hash_url']) ? $conn->real_escape_string($data['hash_url']) : null;
        $nivel_amenaza = isset($data['nivel_amenaza']) ? $conn->real_escape_string($data['nivel_amenaza']) : null;
        $detalles = isset($data['detalles']) ? $conn->real_escape_string($data['detalles']) : null;

        $sql = "UPDATE incidentes SET 
                    tipo_incidente='$tipo_incidente', 
                    prioridad='$prioridad', 
                    fecha_incidente='$fecha_incidente', 
                    responsable='$responsable', 
                    equipo_afectado='$equipo_afectado', 
                    direccion_mac='$direccion_mac', 
                    dependencia='$dependencia', 
                    cantidad_detecciones='$cantidad_detecciones', 
                    estado_equipo='$estado_equipo', 
                    acciones_tomadas='$acciones_tomadas', 
                    hash_url='$hash_url', 
                    nivel_amenaza='$nivel_amenaza', 
                    detalles='$detalles' 
                WHERE id=$id";
        
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Incidente actualizado con éxito."]);
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(["message" => "Error al actualizar el incidente: " . $conn->error]);
        }
        break;

    case 'DELETE':
        // Lógica para eliminar un incidente
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "ID de incidente no proporcionado."]);
            exit();
        }
        $id = $conn->real_escape_string($_GET['id']);
        
        $sql = "DELETE FROM incidentes WHERE id=$id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Incidente eliminado con éxito."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error al eliminar el incidente: " . $conn->error]);
        }
        break;

    default:
        // Método no permitido
        http_response_code(405);
        echo json_encode(["message" => "Método no permitido."]);
        break;
}

$conn->close();
?>