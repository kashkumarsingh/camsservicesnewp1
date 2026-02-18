<?php

declare(strict_types=1);

return [
    'google' => [
        'base_uri' => env('GOOGLE_REVIEWS_BASE_URI', 'https://mybusinessbusinessinformation.googleapis.com/v1'),
        'page_size' => (int) env('GOOGLE_REVIEWS_PAGE_SIZE', 50),
    ],

    'trustpilot' => [
        'auth_uri' => env('TRUSTPILOT_AUTH_URI', 'https://api.trustpilot.com/v1/oauth/oauth-business-users-for-applications/accesstoken'),
        'base_uri' => env('TRUSTPILOT_BASE_URI', 'https://api.trustpilot.com/v1'),
        'page_size' => (int) env('TRUSTPILOT_PAGE_SIZE', 100),
    ],
];


