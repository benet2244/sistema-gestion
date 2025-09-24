<?php
// generar_hash.php
header('Content-Type: text/plain');

// --- ¡IMPORTANTE! ---
// Cambia "admin123" por la contraseña que quieras usar para tu usuario.
$contraseñaPlana = 'root';

// Generar el hash de la contraseña
// PASSWORD_DEFAULT es el algoritmo recomendado actualmente, es fuerte y se actualiza con PHP.
$hash = password_hash($contraseñaPlana, PASSWORD_DEFAULT);

echo "============================================================\n";
echo "SCRIPT PARA GENERAR HASH DE CONTRASEÑA\n";
echo "============================================================\n\n";
echo "Contraseña en texto plano: " . htmlspecialchars($contraseñaPlana) . "\n\n";
echo "Hash seguro generado (cópialo completo):";
echo "\n------------------------------------------------------------\n";
echo $hash;
echo "\n------------------------------------------------------------\n\n";
echo "Instrucción: Copia este hash y úsalo en tu consulta SQL para actualizar la contraseña del usuario.";

?>