<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'database.php';
include_once 'models/Usuario.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(array("mensaje" => "Error de conexión con la base de datos."));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->nombre_usuario) || empty($data->contrasena)) {
    http_response_code(400);
    echo json_encode(array("mensaje" => "Datos incompletos."));
    exit();
}

$usuario = new Usuario($db);
$usuario->nombre_usuario = $data->nombre_usuario;

$stmt = $usuario->leerPorNombre();

if ($stmt && $stmt->num_rows == 1) {
    $row = $stmt->fetch_assoc();
    $hashed_password = $row['contrasena'];

    if (password_verify($data->contrasena, $hashed_password)) {
        http_response_code(200);
        echo json_encode(array(
            "mensaje" => "Login exitoso.",
            "usuario" => array(
                "id" => $row['id'],
                "nombre_usuario" => $row['nombre_usuario'],
                "rol" => $row['rol']
            )
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("mensaje" => "Contraseña incorrecta."));
    }
} else {
    http_response_code(404);
    echo json_encode(array("mensaje" => "Usuario no encontrado."));
}

$db->close();
?>
