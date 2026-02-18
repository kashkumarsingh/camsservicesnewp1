<?php

namespace Database\Seeders;

use App\Models\ExternalReview;
use App\Models\ReviewSource;
use Illuminate\Database\Seeder;

class ExternalReviewSeeder extends Seeder
{
    public function run(): void
    {
        $googleSource = ReviewSource::where('provider', ReviewSource::PROVIDER_GOOGLE)->first();
        $trustpilotSource = ReviewSource::where('provider', ReviewSource::PROVIDER_TRUSTPILOT)->first();

        if (!$googleSource || !$trustpilotSource) {
            $this->command?->warn('ReviewSourceSeeder must run before ExternalReviewSeeder.');
            return;
        }

        $reviews = [
            [
                'review_source_id' => $googleSource->id,
                'provider_review_id' => 'google-review-1',
                'author_name' => 'Sarah M.',
                'author_avatar_url' => null,
                'rating' => 5,
                'content' => 'CAMS Services transformed our son’s SEN support. The staff truly understand trauma-informed care.',
                'language' => 'en',
                'country_code' => 'GB',
                'published_at' => now()->subDays(14),
                'permalink' => 'https://maps.google.com/?cid=demo',
                'metadata' => ['demo' => true],
            ],
            [
                'review_source_id' => $trustpilotSource->id,
                'provider_review_id' => 'trustpilot-review-1',
                'author_name' => 'James T.',
                'author_avatar_url' => null,
                'rating' => 5,
                'content' => 'As a social worker I rely on CAMS for reliable alternative provision. Their reports are detailed and punctual.',
                'language' => 'en',
                'country_code' => 'GB',
                'published_at' => now()->subDays(21),
                'permalink' => 'https://uk.trustpilot.com/review/cams-services-demo',
                'metadata' => ['demo' => true],
            ],
        ];

        foreach ($reviews as $review) {
            ExternalReview::updateOrCreate(
                [
                    'review_source_id' => $review['review_source_id'],
                    'provider_review_id' => $review['provider_review_id'],
                ],
                array_merge($review, [
                    'is_visible' => true,
                    'synced_at' => now(),
                ])
            );
        }
    }
}

