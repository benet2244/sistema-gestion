<?php
header("Access-Control-Allow-Origin: http://localhost:3001");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'database.php';
include_once 'models/Incidente.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(array("mensaje" => "Error de conexión con la base de datos."));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->titulo) &&
    !empty($data->descripcion) &&
    !empty($data->prioridad) &&
    !empty($data->estado) &&
    !empty($data->id_usuario)
) {
    $incidente = new Incidente($db);

    $incidente->titulo = $data->titulo;
    $incidente->descripcion = $data->descripcion;
    $incidente->prioridad = $data->prioridad;
    $incidente->estado = $data->estado;
    $incidente->id_usuario = $data->id_usuario;

    if ($incidente->crear()) {
        http_response_code(201);
        echo json_encode(array("mensaje" => "El incidente fue creado."));
    } else {
        http_response_code(503);
        echo json_encode(array("mensaje" => "No se pudo crear el incidente."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("mensaje" => "No se pudo crear el incidente. Los datos están incompletos."));
}

$db->close();
?>
