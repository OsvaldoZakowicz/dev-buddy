<?php

// configuracion de conexion a ollama
return [
    // url base de la api de ollama
    'base_url' => getenv('OLLAMA_URL') ?: 'http://localhost:11434',

    // modelo a utilizar
    'model' => getenv('OLLAMA_MODEL') ?: 'qwen2.5-coder:3b',

    // parametros de generacion
    'options' => [
        'temperature' => 0.7,  // creatividad: 0 = determinista, 1 = creativo
        'top_p' => 0.9,        // nucleus sampling
        'top_k' => 40,         // limita tokens candidatos
    ],

    // timeouts en segundos
    'timeout' => 120,  // 2 minutos max por respuesta

    // endpoint para chat
    'endpoint' => '/api/generate',
];
