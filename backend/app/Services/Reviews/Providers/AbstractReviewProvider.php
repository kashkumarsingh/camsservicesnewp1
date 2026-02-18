<?php

declare(strict_types=1);

namespace App\Services\Reviews\Providers;

use App\DataTransferObjects\ExternalReviewData;
use App\Models\ReviewSource;
use App\Services\Reviews\Contracts\ReviewProviderInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

abstract class AbstractReviewProvider implements ReviewProviderInterface
{
    /**
     * Execute HTTP call and transform payload to DTOs.
     */
    final public function fetch(ReviewSource $source): Collection
    {
        if ($this->isMisconfigured($source)) {
            Log::warning('Review source missing required credentials.', [
                'provider' => $source->provider,
                'review_source_id' => $source->id,
            ]);

            return collect();
        }

        try {
            $rawReviews = $this->pullReviews($source);

            return collect($rawReviews)
                ->map(fn (array $payload) => ExternalReviewData::fromArray($payload))
                ->filter(fn (ExternalReviewData $review) => filled($review->providerReviewId));
        } catch (\Throwable $exception) {
            Log::error('Review provider fetch failed.', [
                'message' => $exception->getMessage(),
                'provider' => $source->provider,
                'review_source_id' => $source->id,
            ]);

            return collect();
        }
    }

    /**
     * Provider-specific validation.
     */
    abstract protected function isMisconfigured(ReviewSource $source): bool;

    /**
     * Provider-specific API call.
     *
     * @return array<int, array<string, mixed>>
     */
    abstract protected function pullReviews(ReviewSource $source): array;
}


