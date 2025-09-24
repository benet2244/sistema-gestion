<?php
// Incluye el archivo de la clase Database
include 'database.php';

// Crea una nueva instancia de la clase Database
$database = new Database();

// Obtiene la conexión
$db_connection = $database->getConnection();

// Verifica si la conexión fue exitosa
if ($db_connection) {
echo "¡Conexión a la base de datos exitosa! 🎉";
// Cierra la conexión cuando ya no la necesites
$db_connection->close();
} else {
echo "Error: No se pudo establecer la conexión a la base de datos. 😞";
}
?>