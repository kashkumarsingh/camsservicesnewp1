<?php

declare(strict_types=1);

namespace App\Services\Reviews\Providers;

use App\Models\ReviewSource;
use Illuminate\Support\Facades\Http;

class GoogleReviewProvider extends AbstractReviewProvider
{
    protected function isMisconfigured(ReviewSource $source): bool
    {
        return blank($source->api_key) || blank($source->location_id);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function pullReviews(ReviewSource $source): array
    {
        $baseUri = config('reviews.google.base_uri');
        $endpoint = sprintf('%s/%s/reviews', rtrim($baseUri, '/'), ltrim($source->location_id, '/'));

        $response = Http::withToken($source->api_key)
            ->acceptJson()
            ->get($endpoint, [
                'pageSize' => config('reviews.google.page_size', 50),
                'orderBy' => 'update_time desc',
            ]);

        if ($response->failed()) {
            $response->throw();
        }

        $reviews = $response->json('reviews', []);

        return collect($reviews)->map(function (array $review) {
            return [
                'provider_review_id' => $review['reviewId'] ?? '',
                'author_name' => $review['reviewer']['displayName'] ?? 'Google User',
                'author_avatar_url' => $review['reviewer']['profilePhotoUrl'] ?? null,
                'rating' => $review['starRating'] ?? null,
                'content' => $review['comment'] ?? '',
                'language' => $review['reviewReply']['languageCode'] ?? 'en',
                'country_code' => null,
                'published_at' => $review['createTime'] ?? null,
                'permalink' => $review['reviewReply']['link'] ?? null,
                'metadata' => [
                    'update_time' => $review['updateTime'] ?? null,
                ],
            ];
        })->all();
    }
}


