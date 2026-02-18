<?php

declare(strict_types=1);

namespace App\Services\Reviews\Contracts;

use App\DataTransferObjects\ExternalReviewData;
use App\Models\ReviewSource;
use Illuminate\Support\Collection;

/**
 * Contract for remote review providers (Google, Trustpilot, etc.).
 */
interface ReviewProviderInterface
{
    /**
     * Fetch remote reviews for the given source.
     *
     * @return Collection<int, ExternalReviewData>
     */
    public function fetch(ReviewSource $source): Collection;
}


