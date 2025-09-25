<?php
// SOLUCIÓN DEFINITIVA: Desactivar la muestra de errores y activar los logs.
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Encabezados CORS para permitir la comunicación con el frontend.
header("Access-Control-Allow-Origin: http://localhost:3001");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Manejar la solicitud de pre-vuelo (preflight) OPTIONS para CORS.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- FUNCIÓN DE RESPUESTA ESTANDARIZADA ---
function sendJsonResponse($success, $message = '', $data = []) {
    // Establecer el código de respuesta HTTP basado en si la operación fue exitosa.
    http_response_code($success ? 200 : 400);
    // Imprimir la respuesta en formato JSON y terminar la ejecución.
    echo json_encode(['success' => $success, 'message' => $message, 'data' => $data]);
    exit();
}

// --- VERIFICACIÓN CRÍTICA DE cURL ---
if (!function_exists('curl_init')) {
    sendJsonResponse(false, 'Error Crítico de Configuración: La extensión cURL de PHP no está habilitada en este servidor. El análisis no puede continuar.');
}

// --- CONFIGURACIÓN DE VIRUSTOTAL Y ANÁLISIS ---
$apiKey = '34feac7ebb585b5344c220887fa13d760858fc4efe3705a5b935717276aa4f28'; // Tu nueva clave de API
$threatLevelThresholds = ['Crítico' => 20, 'Alto' => 10, 'Medio' => 1, 'Bajo' => 0, 'Bueno' => 0];
$malwareKeywords = '/(Trojan|Worm|Virus|Ransom|Spyware|Backdoor|Keylogger|Malware)/i';

// --- FUNCIONES LÓGICAS DEL ANÁLISIS ---
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
        'tipo_virus' => !empty($detectedTypes) ? implode(', ', array_unique($detectedTypes)) : 'N/A',
        'nombre_virus' => !empty($detectedNames) ? implode(', ', array_unique($detectedNames)) : 'N/A',
    ];
}

function determineThreatLevel($maliciousCount, $thresholds) {
    if ($maliciousCount >= $thresholds['Crítico']) return 'Crítico';
    if ($maliciousCount >= $thresholds['Alto']) return 'Alto';
    if ($maliciousCount >= $thresholds['Medio']) return 'Medio';
    if ($maliciousCount > 0) return 'Bajo';
    return 'Bueno';
}

// --- MANEJO DE LA SOLICITUD POST ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, "Método de solicitud no permitido.");
}

$payload = json_decode(file_get_contents('php://input'), true);
$ioc = $payload['hash'] ?? ''; // Indicador de Compromiso (IOC)

if (empty($ioc) || !is_string($ioc)) {
    sendJsonResponse(false, "Indicador (Hash, URL o IP) no válido.");
}

// Construcción de la URL de la API de VirusTotal según el tipo de IOC.
if (filter_var($ioc, FILTER_VALIDATE_IP)) {
    $urlApi = "https://www.virustotal.com/api/v3/ip_addresses/$ioc";
} elseif (filter_var($ioc, FILTER_VALIDATE_URL)) {
    $url_id = rtrim(base64_encode(rtrim($ioc, "/")), '=');
    $urlApi = "https://www.virustotal.com/api/v3/urls/" . $url_id;
} else {
    $urlApi = "https://www.virustotal.com/api/v3/files/$ioc";
}

$headers = ["x-apikey: $apiKey", "Accept: application/json"];

try {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $urlApi,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => true, 
        CURLOPT_TIMEOUT => 30,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false) throw new Exception("Error de cURL: $curlError");

    $vtResult = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) throw new Exception("Error al decodificar la respuesta JSON de VirusTotal.");

    if ($httpCode === 404) {
        sendJsonResponse(true, "Análisis completado: El indicador no fue encontrado en VirusTotal.", ['nivel_compromiso' => 'Desconocido']);
    }

    if ($httpCode !== 200) {
        $errorMessage = $vtResult['error']['message'] ?? 'Error desconocido en la API de VirusTotal';
        throw new Exception("Error de API de VirusTotal ($httpCode): $errorMessage");
    }
    
    $attributes = $vtResult['data']['attributes'] ?? [];
    $stats = $attributes['last_analysis_stats'] ?? [];
    $results = $attributes['last_analysis_results'] ?? [];

    $maliciousCount = $stats['malicious'] ?? 0;
    $totalScans = array_sum($stats);

    $threatLevel = determineThreatLevel($maliciousCount, $threatLevelThresholds);
    $virusInfo = extractVirusInfo($results, $malwareKeywords);

    sendJsonResponse(true, "Análisis completado con éxito.", [
        'nivel_compromiso' => $threatLevel,
        'tipo_virus' => $virusInfo['tipo_virus'],
        'nombre_virus' => $virusInfo['nombre_virus'],
        'estadisticas' => ['malicious' => $maliciousCount, 'total' => $totalScans],
        'raw_data' => $vtResult // Opcional: para depuración
    ]);

} catch (Exception $e) {
    // Capturar cualquier excepción y enviarla como una respuesta de error clara.
    sendJsonResponse(false, $e->getMessage());
}
?>
