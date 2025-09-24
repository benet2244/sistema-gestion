<?php
// test_conexion.php
// Este script prueba la conexión a la base de datos usando tu configuración.

// Se establece el tipo de contenido para una salida limpia.
header('Content-Type: text/plain; charset=utf-8');

echo "Iniciando prueba de conexión...\n\n";

// Incluir el archivo de configuración.
// Este archivo ya contiene la lógica para conectarse y manejar errores.
// Si la conexión falla, el script se detendrá allí y mostrará un error JSON.
require_once 'config.php';

// Si el script llega a este punto, significa que la conexión fue exitosa
// porque el script no se detuvo en el bloque try-catch de config.php.

// Verificamos que la variable $conn exista y esté activa.
if (isset($conn) && $conn->ping()) {
    echo "****************************************\n";
    echo "** ¡CONEXIÓN EXITOSA! **\n";
    echo "****************************************\n\n";
    echo "La configuración en 'config.php' es correcta.\n\n";
    echo "--- Detalles de la Conexión ---\n";
    echo "Host de la base de datos: " . DB_HOST . "\n";
    echo "Usuario: " . DB_USER . "\n";
    echo "Base de datos: " . DB_NAME . "\n";
    echo "Versión del Servidor MySQL: " . $conn->server_info . "\n";
    echo "Juego de caracteres del cliente: " . $conn->character_set_name() . "\n";

    // Cerramos la conexión ya que solo era una prueba.
    $conn->close();

} else {
    // Este mensaje solo aparecería en el caso improbable de que config.php
    // se ejecute sin errores pero no devuelva una conexión válida.
    echo "****************************************\n";
    echo "** ¡ERROR INESPERADO! **\n";
    echo "****************************************\n\n";
    echo "El script config.php se ejecutó pero no se pudo confirmar una conexión activa.\n";
}
?>