<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * FAQ Model
 * 
 * Clean Architecture Layer: Domain (Eloquent entity bridging Domain ↔ Infrastructure)
 * 
 * Represents a FAQ item with auto-slug generation and scopes.
 */
class FAQ extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'faqs';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'category',
        'views',
        'published',
        'order',
    ];

    protected $casts = [
        'published' => 'boolean',
        'views' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Boot the model and auto-generate slug from title.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($faq) {
            if (empty($faq->slug)) {
                $faq->slug = Str::slug($faq->title);
            }
        });

        static::updating(function ($faq) {
            if ($faq->isDirty('title') && empty($faq->slug)) {
                $faq->slug = Str::slug($faq->title);
            }
        });
    }

    /**
     * Scope: Only published FAQs
     */
    public function scopePublished($query)
    {
        return $query->where('published', true);
    }

    /**
     * Scope: Filter by category (case-insensitive)
     */
    public function scopeCategory($query, string $category)
    {
        return $query->whereRaw('LOWER(category) = LOWER(?)', [$category]);
    }

    /**
     * Scope: Order by custom order field, then by title
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc')->orderBy('title', 'asc');
    }

    /**
     * Increment view counter
     */
    public function incrementViews(): void
    {
        $this->increment('views');
    }

    /**
     * Record a view (alias for incrementViews)
     */
    public function recordView(): void
    {
        $this->incrementViews();
    }
}
