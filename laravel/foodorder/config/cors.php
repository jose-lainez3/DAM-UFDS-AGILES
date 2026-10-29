<?php

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
|
| La API se consume con tokens Bearer desde el front de Vue (localhost:8080)
| y desde la app de Ionic (localhost:8100 / capacitor://localhost), por eso no
| se usan cookies. En producción restringe los orígenes con CORS_ALLOWED_ORIGINS
| (lista separada por comas).
|
*/

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', '*'))
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
