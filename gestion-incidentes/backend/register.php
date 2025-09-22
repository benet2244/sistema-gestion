<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// Conexión a la base de datos
$servername = "localhost";
$username = "Gestion"; // <-- CAMBIAR A 'sistema_web'
$password = "";// La contraseña por defecto en XAMPP suele ser vacía
$dbname = "gestion_incidentes"; // nombre de tu BD

$conn = new mysqli($servername, $username, $password_db, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos."]);
    exit;
}

// Leer datos JSON enviados desde el frontend
$data = json_decode(file_get_contents("php://input"), true);

// Validar campos
if (
    !isset($data['catalogo']) || empty(trim($data['catalogo'])) ||
    !isset($data['nombre']) || empty(trim($data['nombre'])) ||
    !isset($data['apellido']) || empty(trim($data['apellido'])) ||
    !isset($data['password']) || empty(trim($data['password']))
) {
    echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios."]);
    exit;
}

$catalogo = trim($data['catalogo']);
$nombre   = trim($data['nombre']);
$apellido = trim($data['apellido']);
$password = trim($data['password']);

// Verificar si el catálogo ya existe
$sql_check = "SELECT id FROM usuarios WHERE catalogo = ? LIMIT 1";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("s", $catalogo);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "El catálogo ya está registrado."]);
    $stmt_check->close();
    $conn->close();
    exit;
}
$stmt_check->close();

// Encriptar la contraseña
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insertar usuario
$sql_insert = "INSERT INTO usuarios (catalogo, nombre, apellido, password) VALUES (?, ?, ?, ?)";
$stmt_insert = $conn->prepare($sql_insert);
$stmt_insert->bind_param("ssss", $catalogo, $nombre, $apellido, $hashedPassword);

if ($stmt_insert->execute()) {
    echo json_encode(["success" => true, "message" => "Usuario registrado correctamente."]);
} else {
    echo json_encode(["success" => false, "message" => "Error al registrar el usuario."]);
}

$stmt_insert->close();
$conn->close();
