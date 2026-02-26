<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Page Model (Domain Layer)
 * 
 * Represents a static page entity in the system.
 * This is part of the Domain layer in Clean Architecture.
 */
class Page extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'slug',
        'type',
        'content',
        'sections',
        'summary',
        'mission',
        'core_values',
        'safeguarding',
        'last_updated',
        'effective_date',
        'version',
        'views',
        'published',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     * 
     * JSON fields structure (for about page type):
     * - mission: {
     *     title?: string,
     *     description?: string,
     *     image?: string,
     *     service_cards?: array<{label: string, icon?: string}>
     *   }
     * - core_values: array<{
     *     icon: string,
     *     title: string,
     *     description: string,
     *     gradient_from?: string,
     *     gradient_to?: string
     *   }>
     * - safeguarding: {
     *     title?: string,
     *     description?: string,
     *     image?: string,
     *     badges?: array<{label: string}>
     *   }
     * 
     * Note: These fields are only used when page type is 'about'.
     * JSON is used per .cursorrules normalization guidelines:
     * - Non-queryable metadata (page-specific content)
     * - Flexible, unbounded structures (variable number of items)
     * - Not reusable entities (specific to about page)
     */
    protected $casts = [
        'last_updated' => 'datetime',
        'effective_date' => 'date',
        'views' => 'integer',
        'published' => 'boolean',
        'sections' => 'array',
        'mission' => 'array',
        'core_values' => 'array',
        'safeguarding' => 'array',
    ];

    /**
     * Get the page type options.
     *
     * @return array<string>
     */
    public static function getTypeOptions(): array
    {
        return [
            'home' => 'Home',
            'about' => 'About',
            'privacy-policy' => 'Privacy Policy',
            'terms-of-service' => 'Terms of Service',
            'cancellation-policy' => 'Cancellation Policy',
            'cookie-policy' => 'Cookie Policy',
            'payment-refund-policy' => 'Payment & Refund Policy',
            'safeguarding-policy' => 'Safeguarding Policy',
            'other' => 'Other',
        ];
    }

    /**
     * Scope a query to only include published pages.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePublished($query)
    {
        return $query->where('published', true);
    }

    /**
     * Scope a query to filter by type.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Increment the views count.
     *
     * @return void
     */
    public function incrementViews(): void
    {
        $this->increment('views');
    }

    /**
     * Check if the page is effective (effective date is today or in the past).
     *
     * @return bool
     */
    public function isEffective(): bool
    {
        return $this->effective_date <= now();
    }

    /**
     * Check if the page can be viewed.
     *
     * @return bool
     */
    public function canBeViewed(): bool
    {
        return $this->published && $this->isEffective();
    }

    /**
     * Page Builder blocks (ordered by sort_order).
     *
     * @return HasMany<PageBlock>
     */
    public function blocks(): HasMany
    {
        return $this->hasMany(PageBlock::class)->orderBy('sort_order');
    }
}
