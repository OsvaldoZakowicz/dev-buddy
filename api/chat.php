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

// leer input
// file_get_contents('php://input') → lee el body crudo del request como string
// json_decode(..., true) → convierte el string JSON en array asociativo de PHP
// $input → ahora contiene los datos enviados desde el frontend
$input = json_decode(file_get_contents('php://input'), true);

// validar prompt
if (empty($input['prompt'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'prompt requerido']);
    exit;
}

// validar modelo elegido
if (empty($input['model'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'modelo requerido']);
    exit;
}

// validar keep alive elegido
$keepAlive = isset($input['keep_alive']) ? (int)$input['keep_alive'] : 180;
if ($keepAlive < 0 || $keepAlive > 600) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'keep alive no soportado']);
    exit;
}

// preparar request para ollama
$data = [
    'model' => $input['model'],
    'prompt' => $input['prompt'],
    'keep_alive' => $keepAlive,
    'options' => $config['options'],
    'stream' => false,
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

    // logs para docker
    error_log("llamando a url: " . $url);
    error_log("usando modelo: " . $input['model']);

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
        'model' => $result['model'],
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
