<?php
// gestion-incidentes/backend/api/login.php

// Headers para permitir el acceso desde cualquier origen (CORS)
// y definir el tipo de contenido como JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Incluir los archivos de configuración y del modelo de usuario
include_once '../config/database.php';
include_once '../models/Usuario.php';

// --- Inicio del Endpoint ---

// 1. OBTENER CONEXIÓN A LA BASE DE DATOS
$database = new Database();
$db = $database->getConnection();

// 2. CREAR UNA INSTANCIA DEL OBJETO USUARIO
$usuario = new Usuario($db);

// 3. OBTENER LOS DATOS ENVIADOS (del cuerpo de la petición POST)
// Esto espera un JSON con {"nombre_usuario": "...", "contrasena": "..."}
$data = json_decode(file_get_contents("php://input"));

// Asegurarse de que los datos no estén vacíos
if (
    !empty($data->nombre_usuario) &&
    !empty($data->contrasena)
) {
    // 4. BUSCAR AL USUARIO
    $usuario->nombre_usuario = $data->nombre_usuario;
    $usuario_existe = $usuario->buscarPorNombreUsuario();

    // 5. VERIFICAR SI EL USUARIO EXISTE Y LA CONTRASEÑA ES CORRECTA (TEXTO PLANO)
    // ¡¡¡ADVERTENCIA DE SEGURIDAD!!! Esto es solo para desarrollo.
    // En producción, DEBES usar password_verify() con contraseñas hasheadas.
    if ($usuario_existe && $data->contrasena === $usuario->contrasena) {

        // Si el login es exitoso, generar un token (JWT es una buena práctica, por ahora un mensaje simple)
        http_response_code(200); // OK
        echo json_encode(array(
            "mensaje" => "Login exitoso.",
            "rol" => $usuario->rol // Devolver el rol para que el frontend tome decisiones
        ));

    } else {
        // Si el usuario no existe o la contraseña es incorrecta
        http_response_code(401); // No autorizado
        echo json_encode(array("mensaje" => "Credenciales incorrectas."));
    }
} else {
    // Si los datos están incompletos
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(array("mensaje" => "No se pudo iniciar sesión. Datos incompletos."));
}
?>