<?php
// Guardián de seguridad: verifica si el usuario ha iniciado sesión.
require_once 'session_secure.php';

// El resto de los headers son gestionados por el guardián o no son necesarios si las sesiones funcionan correctamente.
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Reporte de errores para depuración
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// --- CONFIGURACIÓN ---
// Reemplaza con tu clave de la API de VirusTotal real
$apiKey = '66586fe48e2e43f02d07f122e48e98f8a4fd569b56d6f596a4b204b4d910e114'; 
$threatLevelThresholds = [
    'Crítico' => 20,
    'Alto' => 10,
    'Medio' => 1,
    'Bajo' => 0, // Detección, pero no maliciosa
    'Bueno' => 0, // Sin detecciones
];
$malwareKeywords = '/(Trojan|Worm|Virus|Ransom|Spyware|Backdoor|Keylogger|Malware)/i';

// --- FUNCIONES AUXILIARES ---

// Envía una respuesta JSON consistente y termina la ejecución del script
function sendJsonResponse($success, $message = '', $data = []) {
    http_response_code($success ? 200 : 400);
    echo json_encode(['success' => $success, 'message' => $message, 'data' => $data]);
    exit();
}

// Extrae información relevante de los resultados de VirusTotal
function extractVirusInfo($analysisResults, $malwareKeywords) {
    $detectedTypes = [];
    $detectedNames = [];
    foreach ($analysisResults as $result) {
        if (!empty($result['result'])) {
            $detectedNames[] = $result['result'];
            if (preg_match($malwareKeywords, $result['result'], $matches)) {
                $detectedTypes[] = ucfirst(strtolower($matches[1]));
            }
        }
    }
    return [
        'tipo_virus' => !empty($detectedTypes) ? implode(', ', array_unique($detectedTypes)) : 'Desconocido',
        'nombre_virus' => !empty($detectedNames) ? implode(', ', array_unique($detectedNames)) : 'Desconocido',
    ];
}

// Determina el nivel de amenaza basado en el número de detecciones maliciosas
function determineThreatLevel($maliciousCount, $thresholds) {
    if ($maliciousCount >= $thresholds['Crítico']) return 'Crítico';
    if ($maliciousCount >= $thresholds['Alto']) return 'Alto';
    if ($maliciousCount >= $thresholds['Medio']) return 'Medio';
    if ($maliciousCount > $thresholds['Bajo']) return 'Bueno';
    return 'Bueno';
}

// --- MANEJO DE LA SOLICITUD ---

// Manejar solicitud OPTIONS (pre-vuelo CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(true);
}

// Asegurarse de que el método de la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, "Método de solicitud no permitido.");
}

// Decodificar la entrada JSON del cuerpo de la solicitud
$json = file_get_contents('php://input');
$payload = json_decode($json, true);

// Validar el hash/URL proporcionado
$hash = $payload['hash'] ?? '';
if (empty($hash) || !is_string($hash)) {
    sendJsonResponse(false, "Hash no válido.");
}

// Determinar si es un hash de archivo o una URL
$isUrl = filter_var($hash, FILTER_VALIDATE_URL);

if ($isUrl) {
    // Análisis de URL
    $urlApi = "https://www.virustotal.com/api/v3/urls/" . hash('sha256', $hash);
} else {
    // Análisis de hash de archivo
    $urlApi = "https://www.virustotal.com/api/v3/files/$hash";
}

// Encabezados para la solicitud a la API de VirusTotal
$headers = ["x-apikey: $apiKey", "Accept: application/json"];

try {
    // Inicializar cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $urlApi);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        throw new Exception("Error de conexión con VirusTotal: $curlError");
    }

    $vtResult = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Error al decodificar la respuesta de VirusTotal.");
    }

    if ($httpCode === 404) {
        sendJsonResponse(true, "No se encontró información para el hash/URL.", ['nivel_compromiso' => 'Desconocido', 'estadisticas' => ['malicious' => 0, 'total' => 0]]);
    }

    if ($httpCode !== 200) {
        $errorMessage = $vtResult['error']['message'] ?? 'Error desconocido de la API de VirusTotal';
        throw new Exception("Error de la API de VirusTotal ($httpCode): $errorMessage");
    }
    
    // Extracción de datos del resultado de la API
    $analysisAttributes = $vtResult['data']['attributes'] ?? [];
    $analysisStats = $analysisAttributes['last_analysis_stats'] ?? [];
    $analysisResults = $analysisAttributes['last_analysis_results'] ?? [];

    $maliciousCount = $analysisStats['malicious'] ?? 0;
    $totalCount = $analysisStats['harmless'] + $analysisStats['malicious'] + $analysisStats['suspicious'] + $analysisStats['undetected'] + $analysisStats['timeout'];

    $threatLevel = determineThreatLevel($maliciousCount, $thresholds);
    $virusInfo = extractVirusInfo($analysisResults, $malwareKeywords);

    sendJsonResponse(true, "Análisis completado", [
        'nivel_compromiso' => $threatLevel,
        'tipo_virus' => $virusInfo['tipo_virus'],
        'nombre_virus' => $virusInfo['nombre_virus'],
        'estadisticas' => [
            'malicious' => $maliciousCount,
            'total' => $totalCount,
        ],
    ]);

} catch (Exception $e) {
    error_log("Error en analizar_hash.php: " . $e->getMessage());
    sendJsonResponse(false, $e->getMessage());
}
?>