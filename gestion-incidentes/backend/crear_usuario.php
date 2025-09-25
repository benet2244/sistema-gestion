<?php
// gestion-incidentes/backend/crear_usuario.php

include_once 'database.php';
include_once 'models/Usuario.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array("mensaje" => "Error: Solamente se acepta el método POST."));
    exit();
}

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(array("mensaje" => "Error de conexión con la base de datos."));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->nombre_usuario) || empty($data->contrasena) || empty($data->rol)) {
    http_response_code(400);
    echo json_encode(array("mensaje" => "Error: Faltan datos para crear el usuario."));
    exit();
}

$usuario = new Usuario($db);

$usuario->nombre_usuario = $data->nombre_usuario;
$usuario->contrasena = password_hash($data->contrasena, PASSWORD_BCRYPT); // Hashear la contraseña
$usuario->rol = $data->rol;

if ($usuario->crear()) {
    http_response_code(201);
    echo json_encode(array("mensaje" => "Usuario creado con éxito."));
} else {
    http_response_code(500);
    echo json_encode(array("mensaje" => "Error al crear el usuario."));
}

$db->close();
?>