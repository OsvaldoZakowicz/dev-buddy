<?php
// configuracion de conexion a ollama
return [
    'base_url' => getenv('OLLAMA_URL') ?: 'http://localhost:11434',
    'model' => getenv('OLLAMA_MODEL') ?: 'qwen2.5-coder:3b',
    'options' => [
        'temperature' => 0.7,
        'top_p' => 0.9,
        'top_k' => 40,
    ],
    'timeout' => 120,

    // endpoints disponibles
    'endpoints' => [
        'generate' => '/api/generate',  // chat sin stream
        'tags' => '/api/tags',          // listar modelos
    ],
];
