<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Origin: *');

// Iniciar la sesión de forma segura para leer sus datos
session_set_cookie_params(['lifetime' => 3600, 'path' => '/', 'domain' => 'localhost', 'secure' => false, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    // La sesión está activa, devolver los datos del usuario
    echo json_encode([
        'success' => true,
        'loggedin' => true,
        'user' => [
            'username' => $_SESSION['username'],
            'nombre_completo' => $_SESSION['nombre_completo'],
            'rol' => $_SESSION['rol']
        ]
    ]);
} else {
    // No hay sesión activa
    echo json_encode(['success' => false, 'loggedin' => false]);
}
?>