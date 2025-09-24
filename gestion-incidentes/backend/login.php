<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true'); // Permite cookies y sesiones
// El origen debe ser específico en producción por seguridad
header('Access-Control-Allow-Origin: *');

// Iniciar la sesión de forma segura
session_set_cookie_params(['lifetime' => 3600, 'path' => '/', 'domain' => 'localhost', 'secure' => false, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'));

    $username = $data->username ?? '';
    $password = $data->password ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Usuario y contraseña son requeridos.']);
        exit;
    }

    $sql = "SELECT id, username, password_hash, nombre_completo, rol FROM usuarios WHERE username = ? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // --- ADVERTENCIA DE SEGURIDAD ---
        // La siguiente línea compara contraseñas en texto plano.
        // Esto es extremadamente inseguro y solo debe usarse para depuración.
        // La forma correcta y segura es: if (password_verify($password, $user['password_hash']))
        if ($password === $user['password_hash']) {
            // Regenerar ID de sesión para prevenir fijación de sesión
            session_regenerate_id(true);

            // Guardar datos del usuario en la sesión
            $_SESSION['loggedin'] = true;
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['nombre_completo'] = $user['nombre_completo'];
            $_SESSION['rol'] = $user['rol'];

            echo json_encode([
                'success' => true, 
                'message' => 'Inicio de sesión exitoso.',
                'user' => [
                    'username' => $user['username'],
                    'nombre_completo' => $user['nombre_completo'],
                    'rol' => $user['rol']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas.']);
        }
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas.']);
    }

    $stmt->close();
    $conn->close();
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
}
?>