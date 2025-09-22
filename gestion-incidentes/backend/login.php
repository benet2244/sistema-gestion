<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// Conexión a la base de datos
$servername = "localhost";
$username = "Gestion"; // <-- CAMBIAR A 'sistema_web'
$password = "";// La contraseña por defecto en XAMPP suele ser vacía
$dbname = "gestion_incidentes";// tu BD

$conn = new mysqli($servername, $username, $password_db, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos"]);
    exit;
}

// Leer datos JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['catalogo']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
    exit;
}

$catalogo = trim($data['catalogo']);
$password = trim($data['password']);

// Buscar usuario por catálogo
$sql = "SELECT id, catalogo, password FROM usuarios WHERE catalogo = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $catalogo);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $hashedPassword = $row['password'];

    // Verificar contraseña
    if (password_verify($password, $hashedPassword)) {
        echo json_encode([
            "success" => true,
            "message" => "Login exitoso",
            "user" => [
                "id" => $row['id'],
                "catalogo" => $row['catalogo']
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
}

$stmt->close();
$conn->close();
