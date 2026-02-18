<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Testimonial Model
 *
 * Clean Architecture Layer: Domain (Eloquent entity bridging Domain ↔ Infrastructure)
 *
 * Represents curated testimonials that appear across the marketing site.
 * Can originate from manual CMS input or promoted external reviews (Google/Trustpilot).
 */
class Testimonial extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const SOURCE_MANUAL = 'manual';
    public const SOURCE_GOOGLE = 'google';
    public const SOURCE_TRUSTPILOT = 'trustpilot';
    public const SOURCE_OTHER = 'other';

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'public_id',
        'slug',
        'author_name',
        'author_role',
        'author_avatar_url',
        'quote',
        'rating',
        'source_type',
        'external_review_id',
        'source_review_id',
        'source_url',
        'source_label',
        'locale',
        'is_featured',
        'display_order',
        'published',
        'published_at',
        'featured_at',
        'badges',
        'metadata',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'integer',
        'is_featured' => 'boolean',
        'display_order' => 'integer',
        'published' => 'boolean',
        'published_at' => 'datetime',
        'featured_at' => 'datetime',
        'badges' => 'array',
        'metadata' => 'array',
        'deleted_at' => 'datetime',
    ];

    /**
     * Automatically assign UUID + slug if omitted.
     */
    protected static function booted(): void
    {
        static::creating(function (self $testimonial): void {
            if (empty($testimonial->public_id)) {
                $testimonial->public_id = (string) Str::uuid();
            }

            if (empty($testimonial->slug)) {
                $testimonial->slug = Str::slug(Str::limit($testimonial->author_name . '-' . Str::random(6), 50));
            }
        });
    }

    /**
     * Reference to the external review (if sourced from Google/Trustpilot).
     */
    public function externalReview(): BelongsTo
    {
        return $this->belongsTo(ExternalReview::class);
    }

    /**
     * Get the packages associated with this testimonial.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(Package::class, 'package_testimonial')
            ->withPivot('order')
            ->withTimestamps()
            ->orderByPivot('order');
    }

    /**
     * Scope: only published testimonials.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('published', true);
    }

    /**
     * Scope: featured testimonials ordered by manual priority then recency.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query
            ->where('is_featured', true)
            ->orderByDesc('featured_at')
            ->orderBy('display_order');
    }
}

