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
        'timeout' => $config['timeout']
    ]
]);

// llamar a ollama
try {
    $url = $config['base_url'] . $config['endpoint'];
    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
        throw new Exception('error al conectar con ollama');
    }

    $result = json_decode($response, true);

    if (!isset($result['response'])) {
        throw new Exception('respuesta invalida de ollama');
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
