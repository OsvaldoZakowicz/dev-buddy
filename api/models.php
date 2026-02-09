<?php
// headers para json y cors
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// manejar preflight
// medida de seguridad del navegador: pregunta si puede hacer get a este endpoint?,
// respondemos de inmediato: ok
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// solo permitir get
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'metodo no permitido']);
    exit;
}

// cargar configuracion
// NOTA: __DIR__ es variable magica que contiene el directorio actual
$config = require __DIR__ . '/../config/ollama.php';

// debug: verificar configuracion
// visible en docker logs
error_log("Fetching models from: " . $config['base_url']);

// construir url para listar modelos
$url = $config['base_url'] . $config['endpoints']['tags'];

// configurar contexto http
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'timeout' => 30,  // timeout mas corto que chat
        'ignore_errors' => true
    ]
]);

try {
    // llamar a ollama
    $response = @file_get_contents($url, false, $context);

    // si file_get_contents falla
    // error de conexion, ollama no disponible, ...
    if ($response === false) {
        $error = error_get_last();
        error_log("error al conectar con ollama: " . ($error['message'] ?? 'unknown'));
        throw new Exception("error al conectar con ollama: " . ($error['message'] ?? 'unknown'));
    }

    // decodificar respuesta
    $result = json_decode($response, true);

    // validar estructura de respuesta, espero un: "models[ ...]" en el JSON
    if (!isset($result['models'])) {
        error_log("respuesta invalida desde ollama: " . $response);
        throw new Exception("respuesta invalida desde ollama: " . $response);
    }

    // procesar respuesta
    $models = array_map(function ($model) {
        $formatted = [
            'name' => $model['name'],
            'size' => $model['size'] ?? null,
            'modified_at' => $model['modified_at'] ?? null
        ];

        // agregar detalles si existen
        if (isset($model['details'])) {
            $formatted['parameter_size'] = $model['details']['parameter_size'] ?? null;
            $formatted['quantization_level'] = $model['details']['quantization_level'] ?? null;
        }

        return $formatted;
    }, $result["models"]);

    // respuesta exitosa
    echo json_encode([
        'success' => true,
        'error' => null,
        'models' => $models
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'models' => [],
    ]);
}
