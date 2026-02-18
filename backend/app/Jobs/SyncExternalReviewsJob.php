<?php

declare(strict_types=1);

namespace App\Jobs;

use App\DataTransferObjects\ExternalReviewData;
use App\Models\ExternalReview;
use App\Models\ReviewSource;
use App\Services\Reviews\ReviewProviderFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class SyncExternalReviewsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        protected ?int $reviewSourceId = null
    ) {
    }

    public function handle(ReviewProviderFactory $providerFactory): void
    {
        $sources = ReviewSource::query()
            ->when($this->reviewSourceId, fn ($query) => $query->whereKey($this->reviewSourceId))
            ->where('is_active', true)
            ->get();

        foreach ($sources as $source) {
            $now = Carbon::now();
            $source->forceFill(['last_sync_attempt_at' => $now])->save();

            try {
                $provider = $providerFactory->make($source->provider);
            } catch (\Throwable $exception) {
                Log::error('Unsupported review provider.', [
                    'provider' => $source->provider,
                    'review_source_id' => $source->id,
                    'message' => $exception->getMessage(),
                ]);
                continue;
            }

            $reviews = $provider->fetch($source);
            $imported = $this->persistReviews($source, $reviews);

            $source->forceFill([
                'last_synced_at' => $imported > 0 ? $now : $source->last_synced_at,
                'last_sync_review_count' => $imported,
            ])->save();
        }
    }

    /**
     * @param Collection<int, ExternalReviewData> $reviews
     */
    protected function persistReviews(ReviewSource $source, Collection $reviews): int
    {
        $imported = 0;
        foreach ($reviews as $reviewData) {
            ExternalReview::updateOrCreate(
                [
                    'review_source_id' => $source->id,
                    'provider_review_id' => $reviewData->providerReviewId,
                ],
                [
                    'author_name' => $reviewData->authorName,
                    'author_avatar_url' => $reviewData->authorAvatarUrl,
                    'rating' => $reviewData->rating,
                    'content' => $reviewData->content,
                    'language' => $reviewData->language,
                    'country_code' => $reviewData->countryCode,
                    'published_at' => $reviewData->publishedAt,
                    'permalink' => $reviewData->permalink,
                    'metadata' => $reviewData->metadata,
                    'synced_at' => now(),
                ]
            );

            $imported++;
        }

        return $imported;
    }
}


