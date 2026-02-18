<?php

declare(strict_types=1);

namespace App\Services\Reviews;

use App\Services\Reviews\Contracts\ReviewProviderInterface;
use App\Services\Reviews\Providers\GoogleReviewProvider;
use App\Services\Reviews\Providers\TrustpilotReviewProvider;
use InvalidArgumentException;

class ReviewProviderFactory
{
    public function __construct(
        protected GoogleReviewProvider $googleProvider,
        protected TrustpilotReviewProvider $trustpilotProvider,
    ) {
    }

    public function make(string $provider): ReviewProviderInterface
    {
        return match ($provider) {
            'google' => $this->googleProvider,
            'trustpilot' => $this->trustpilotProvider,
            default => throw new InvalidArgumentException("Unsupported review provider [{$provider}]"),
        };
    }
}


