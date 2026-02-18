<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Service Model
 *
 * Clean Architecture Layer: Domain (Entity persisted via Eloquent)
 * Purpose: Represents CMS-managed services and encapsulates behaviour (scopes, helpers).
 */
class Service extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'description',
        'body',
        'hero',
        'content_section',
        'cta_section',
        'icon',
        'category',
        'views',
        'published',
        'publish_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     * 
     * JSON fields structure for structured sections:
     * - hero: {
     *     primary_cta?: { text: string, href: string },
     *     secondary_cta?: { text: string, href: string }
     *   }
     * - content_section: {
     *     title?: string
     *   }
     * - cta_section: {
     *     title?: string,
     *     subtitle?: string,
     *     primary_cta?: { text: string, href: string },
     *     secondary_cta?: { text: string, href: string }
     *   }
     * 
     * Note: These fields are used for structured page sections.
     * JSON is used per .cursorrules normalization guidelines:
     * - Non-queryable metadata (service-specific content)
     * - Flexible, unbounded structures (CTAs can vary)
     * - Not reusable entities (specific to each service)
     */
    protected $casts = [
        'published' => 'boolean',
        'publish_at' => 'datetime',
        'hero' => 'array',
        'content_section' => 'array',
        'cta_section' => 'array',
    ];

    /**
     * Boot hook to ensure slug is set when creating a service.
     */
    protected static function booted(): void
    {
        static::creating(function (Service $service): void {
            if (empty($service->slug)) {
                $service->slug = Str::slug($service->title);
            }
        });
    }

    /**
     * Scope: only published services.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('published', true)
            ->where(function (Builder $inner) {
                $inner->whereNull('publish_at')
                    ->orWhere('publish_at', '<=', now());
            });
    }

    /**
     * Scope: category filter.
     */
    public function scopeCategory(Builder $query, ?string $category): Builder
    {
        return $category ? $query->where('category', $category) : $query;
    }

    /**
     * Helper: increment view count safely.
     */
    public function recordView(): bool
    {
        return $this->increment('views');
    }
}


