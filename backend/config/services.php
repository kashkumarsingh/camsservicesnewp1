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

    'next' => [
        'revalidate_url' => env('NEXT_REVALIDATE_URL'),
        'revalidate_secret' => env('NEXT_REVALIDATE_SECRET'),
    ],

    'whatsapp' => [
        'enabled' => (bool) env('WHATSAPP_ENABLED', false),
        'endpoint' => env('WHATSAPP_ENDPOINT'),
        'token' => env('WHATSAPP_API_TOKEN'),
        'from' => env('WHATSAPP_FROM'),
    ],

    'zapier' => [
        'enabled' => (bool) env('ZAPIER_WEBHOOK_ENABLED', false),
        'url' => env('ZAPIER_WEBHOOK_URL'),
        'secret' => env('ZAPIER_WEBHOOK_SECRET'),
    ],

    'stripe' => [
        'secret_key' => env('STRIPE_SECRET_KEY'),
        'public_key' => env('STRIPE_PUBLIC_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Frontend Application URL
    |--------------------------------------------------------------------------
    |
    | The URL of the frontend application. Used for redirects and external
    | links (e.g., Stripe checkout redirects).
    |
    */

    'frontend' => [
        'url' => env('FRONTEND_URL', env('APP_URL')),
    ],

];


