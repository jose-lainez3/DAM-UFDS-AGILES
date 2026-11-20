<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // Integración fiscal opcional; no se transmite a Hacienda hasta habilitarla explícitamente.
    'lumen_dte' => [
        'enabled' => env('DTE_LUMEN_ENABLED', false),
        'production' => env('DTE_LUMEN_PRODUCTION', false),
        'production_confirmed' => env('DTE_LUMEN_PRODUCTION_CONFIRMED', false),
        'api_key' => env('DTE_LUMEN_API_KEY'),
        'company_nrc' => env('DTE_LUMEN_COMPANY_NRC'),
        'establishment' => env('DTE_LUMEN_ESTABLISHMENT'),
        'point_of_sale' => env('DTE_LUMEN_POINT_OF_SALE'),
    ],

    'wompi' => [
        'client_id' => env('WOMPI_CLIENT_ID'),
        'client_secret' => env('WOMPI_CLIENT_SECRET'),
        'production' => env('WOMPI_PRODUCTION', false),
        'return_url' => env('WOMPI_RETURN_URL'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
