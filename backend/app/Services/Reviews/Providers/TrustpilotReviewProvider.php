<?php

declare(strict_types=1);

namespace App\Services\Reviews\Providers;

use App\Models\ReviewSource;
use Illuminate\Support\Facades\Http;

class TrustpilotReviewProvider extends AbstractReviewProvider
{
    protected function isMisconfigured(ReviewSource $source): bool
    {
        return blank($source->api_key) || blank($source->api_secret) || blank($source->location_id);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function pullReviews(ReviewSource $source): array
    {
        $tokenResponse = Http::asForm()
            ->withBasicAuth($source->api_key, $source->api_secret)
            ->post(config('reviews.trustpilot.auth_uri'), [
                'grant_type' => 'client_credentials',
            ])
            ->throw();

        $accessToken = $tokenResponse->json('access_token');

        if (!$accessToken) {
            return [];
        }

        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->get(config('reviews.trustpilot.base_uri') . '/business-units/' . $source->location_id . '/reviews', [
                'perPage' => config('reviews.trustpilot.page_size', 100),
                'orderBy' => 'createdat desc',
            ]);

        if ($response->failed()) {
            $response->throw();
        }

        $reviews = $response->json('reviews', []);

        return collect($reviews)->map(function (array $review) {
            return [
                'provider_review_id' => $review['id'] ?? '',
                'author_name' => $review['consumer']['displayName'] ?? 'Trustpilot User',
                'author_avatar_url' => $review['consumer']['image']['link'] ?? null,
                'rating' => $review['stars'] ?? null,
                'content' => $review['text'] ?? '',
                'language' => $review['language'] ?? 'en',
                'country_code' => $review['consumer']['country'] ?? null,
                'published_at' => $review['createdAt'] ?? null,
                'permalink' => $review['links']['reviewUrl'] ?? null,
                'metadata' => [
                    'title' => $review['title'] ?? null,
                ],
            ];
        })->all();
    }
}


