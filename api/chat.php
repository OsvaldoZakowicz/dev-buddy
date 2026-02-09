<?php

// headers para json y cors
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// solo permitir post
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'metodo no permitido']);
    exit;
}

// cargar configuracion
$config = require __DIR__ . '/../config/ollama.php';

// debug: verificar configuracion
error_log("OLLAMA_URL: " . $config['base_url']);
error_log("OLLAMA_MODEL: " . $config['model']);

// leer input
$input = json_decode(file_get_contents('php://input'), true);

// validar prompt
if (empty($input['prompt'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'prompt requerido']);
    exit;
}

// preparar request para ollama
$data = [
    'model' => $config['model'],
    'prompt' => $input['prompt'],
    'stream' => false,
    'options' => $config['options']
];

// configurar contexto http
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode($data),
        'timeout' => $config['timeout'],
        'ignore_errors' => true  // para ver errores http
    ]
]);

try {
    // llamar a ollama
    $url = $config['base_url'] . $config['endpoints']['generate'];

    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
        $error = error_get_last();
        error_log("error al conectar con ollama: " . ($error['message'] ?? 'unknown'));
        throw new Exception('error al conectar con ollama: ' . ($error['message'] ?? 'unknown'));
    }

    $result = json_decode($response, true);

    if (!isset($result['response'])) {
        error_log("respuesta invalida desde ollama: " . $response);
        throw new Exception('respuesta invalida desde ollama: ' . json_encode($response));
    }

    // respuesta exitosa
    echo json_encode([
        'success' => true,
        'data' => $result['response'],
        'error' => null
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'data' => null
    ]);
}
