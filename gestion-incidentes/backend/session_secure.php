<?php
/*
 * Guardián de Sesión
 * Este script se incluye en todos los endpoints protegidos.
 * Verifica si existe una sesión de usuario activa y válida.
 * Si no, detiene la ejecución y devuelve un error 403 (Prohibido).
 */

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Origin: http://localhost:3000'); // Es crucial para que las cookies de sesión se envíen

// Configuración de la cookie de sesión para mayor seguridad
session_set_cookie_params([
    'lifetime' => 3600, // La sesión dura 1 hora
    'path' => '/',
    'domain' => 'localhost', // Cambiar en producción
    'secure' => false,    // Poner a true si usas HTTPS
    'httponly' => true,   // La cookie no es accesible por JavaScript
    'samesite' => 'Lax'    // Mitiga ataques CSRF
]);

session_start();

// Verificar si el usuario está logueado
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    // Si no está logueado, enviar una respuesta de acceso no autorizado
    http_response_code(403); // Forbidden: el cliente no tiene derechos de acceso
    header('Content-Type: application/json'); // Asegurarnos de que el cliente entienda la respuesta
    echo json_encode([
        'success' => false,
        'message' => 'Acceso no autorizado. Por favor, inicie sesión.'
    ]);
    die(); // Detiene la ejecución del script que lo incluyó
}

// Si la sesión es válida, el script que lo incluyó continuará su ejecución.
?>