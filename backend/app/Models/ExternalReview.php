<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * ExternalReview Model
 *
 * Clean Architecture Layer: Domain (Eloquent entity bridging Domain ↔ Infrastructure)
 *
 * Represents a single review pulled from a remote provider (Google, Trustpilot, etc.).
 * Records are immutable snapshots that can be promoted to curated testimonials.
 */
class ExternalReview extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'review_source_id',
        'provider_review_id',
        'author_name',
        'author_avatar_url',
        'rating',
        'content',
        'language',
        'country_code',
        'published_at',
        'permalink',
        'is_visible',
        'synced_at',
        'metadata',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'integer',
        'published_at' => 'datetime',
        'synced_at' => 'datetime',
        'is_visible' => 'boolean',
        'metadata' => 'array',
        'deleted_at' => 'datetime',
    ];

    /**
     * Parent review source configuration.
     */
    public function reviewSource(): BelongsTo
    {
        return $this->belongsTo(ReviewSource::class);
    }

    /**
     * Curated testimonial derived from this review (if any).
     */
    public function testimonial(): HasOne
    {
        return $this->hasOne(Testimonial::class);
    }

    /**
     * Scope to only visible reviews.
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }
}

