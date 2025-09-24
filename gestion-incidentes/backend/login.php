<?php
// gestion-incidentes/backend/login.php

// Incluir archivos de configuración y modelos
include_once 'database.php'; 
include_once 'models/Usuario.php'; 

// --- Configuración de CORS y Headers ---

// ¡CORRECCIÓN! Se unifica el puerto a 3000 para el frontend
header("Access-Control-Allow-Origin: http://localhost:3000"); 

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
// --- Fin Headers --

// Conexión a la base de datos
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(array("mensaje" => "Error de conexión con la base de datos."));
    exit();
}

// Obtener datos del cuerpo de la solicitud JSON
$data = json_decode(file_get_contents("php://input"));

// Validación básica de datos
if (empty($data->nombre_usuario) || empty($data->contrasena)) {
    http_response_code(400); 
    echo json_encode(array("mensaje" => "Error: Faltan el nombre de usuario o la contraseña."));
    exit();
}

// Inicializar objeto Usuario
$usuario = new Usuario($db);

$usuario->nombre_usuario = $data->nombre_usuario;
$contrasena_plana = $data->contrasena; 

// Buscar el usuario en la base de datos
if ($usuario->buscarPorNombreUsuario()) {
    
    // El usuario existe. Ahora verificamos la contraseña usando password_verify.
    // Esto compara la contraseña en texto plano del formulario con el hash de la BD.
    if (password_verify($contrasena_plana, $usuario->contrasena)) { 
        
        // Login exitoso
        http_response_code(200);
        echo json_encode(array(
            "mensaje" => "Inicio de sesión exitoso. ¡Redireccionando a la gestión de incidentes!",
            "rol" => $usuario->rol,
            "id_usuario" => $usuario->id
        ));
        
    } else {
        // Contraseña incorrecta
        http_response_code(401); 
        echo json_encode(array("mensaje" => "Error de inicio de sesión. Contraseña incorrecta."));
    }
} else {
    // Usuario no encontrado 
    http_response_code(401); 
    echo json_encode(array("mensaje" => "Error de inicio de sesión. Usuario no encontrado."));
}

$db->close();
?>