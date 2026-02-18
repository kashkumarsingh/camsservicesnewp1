<?php

namespace Database\Seeders;

use App\Models\ReviewSource;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ReviewSourceSeeder extends Seeder
{
    public function run(): void
    {
        $sources = [
            [
                'provider' => ReviewSource::PROVIDER_GOOGLE,
                'display_name' => 'Google Reviews',
                'location_id' => 'locations/cams-services-demo',
                'api_key' => 'demo-google-api-key',
                'sync_frequency_minutes' => 360,
                'settings' => [
                    'demo' => true,
                    'instructions' => 'Replace with real Google Business Profile place ID + API key.',
                ],
            ],
            [
                'provider' => ReviewSource::PROVIDER_TRUSTPILOT,
                'display_name' => 'Trustpilot',
                'location_id' => 'business-units/cams-services-demo',
                'api_key' => 'demo-trustpilot-client-id',
                'api_secret' => 'demo-trustpilot-client-secret',
                'sync_frequency_minutes' => 720,
                'settings' => [
                    'demo' => true,
                    'instructions' => 'Replace with real Trustpilot client credentials + business unit ID.',
                ],
            ],
        ];

        foreach ($sources as $source) {
            ReviewSource::updateOrCreate(
                ['provider' => $source['provider'], 'location_id' => $source['location_id']],
                [
                    'display_name' => $source['display_name'],
                    'api_key' => $source['api_key'] ?? null,
                    'api_secret' => $source['api_secret'] ?? null,
                    'sync_frequency_minutes' => $source['sync_frequency_minutes'],
                    'settings' => $source['settings'] ?? [],
                    'is_active' => true,
                    'last_synced_at' => null,
                    'last_sync_attempt_at' => null,
                    'last_sync_review_count' => 0,
                ]
            );
        }
    }
}

