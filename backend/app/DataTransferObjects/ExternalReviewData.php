<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;

/**
 * Immutable DTO representing a remote review payload.
 */
final class ExternalReviewData
{
    public function __construct(
        public readonly string $providerReviewId,
        public readonly string $authorName,
        public readonly ?string $authorAvatarUrl,
        public readonly ?int $rating,
        public readonly string $content,
        public readonly string $language,
        public readonly ?string $countryCode,
        public readonly ?Carbon $publishedAt,
        public readonly ?string $permalink,
        public readonly array $metadata = [],
    ) {
    }

    /**
     * Convenience factory for loosely structured arrays.
     *
     * @param array<string, mixed> $payload
     */
    public static function fromArray(array $payload): self
    {
        return new self(
            providerReviewId: (string) Arr::get($payload, 'provider_review_id'),
            authorName: (string) Arr::get($payload, 'author_name', 'Anonymous'),
            authorAvatarUrl: Arr::get($payload, 'author_avatar_url'),
            rating: Arr::get($payload, 'rating') !== null ? (int) Arr::get($payload, 'rating') : null,
            content: (string) Arr::get($payload, 'content', ''),
            language: (string) Arr::get($payload, 'language', 'en'),
            countryCode: Arr::get($payload, 'country_code'),
            publishedAt: Arr::get($payload, 'published_at')
                ? Carbon::parse(Arr::get($payload, 'published_at'))
                : null,
            permalink: Arr::get($payload, 'permalink'),
            metadata: Arr::get($payload, 'metadata', []),
        );
    }
}


