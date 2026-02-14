<?php

/**
 * helper para obtener variables de entorno con auto-casting de tipos
 *
 * @param string $key nombre de la variable de entorno
 * @param mixed $default valor por defecto si no existe
 * @return mixed valor de la variable con tipo apropiado
 */
function getEnvValue(string $key, mixed $default = null): mixed
{
    // obtenemos desde .env el valor segun la clave
    $value = getenv($key);

    // si value es false, devolvemos default
    if ($value === false) {
        return $default;
    }

    // auto-casting tipos comunes
    // si es numero o string numerico
    if (is_numeric($value)) {
        // si tiene "." o no, castea a float o int
        return strpos($value, ".") !== false ? (float)$value : (int)$value;
    }

    // si no es numerico, es string
    return $value;
}

/**
 * obtiene configuracion completa de ollama
 *
 * @return array configuracion con base_url, timeout, options y endpoints
 */
function getOllamaConfig(): array
{
    return [
        'base_url'  => getEnvValue('OLLAMA_URL', 'http://localhost:11434'),
        'timeout'   => getEnvValue('OLLAMA_TIMEOUT', 300),
        'options'   => [
            'temperature'   => getEnvValue('OLLAMA_TEMPERATURE', 0.7),
            'top_p'         => getEnvValue('OLLAMA_TOP_P', 0.9),
            'top_k'         => getEnvValue('OLLAMA_TOP_K', 40),
        ],

        // endpoints disponibles
        'endpoints' => [
            'generate'  => '/api/generate',     // chat sin stream
            'tags'      => '/api/tags',         // listar modelos
        ],
    ];
}
