<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'hero_image',
        'excerpt',
        'content',
        'author_name',
        'author_role',
        'author_avatar_url',
        'is_featured',
        'is_published',
        'published_at',
        'scheduled_publish_at',
        'reading_time',
        'views',
        'seo',
        'hero_metadata',
        'structured_content',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'scheduled_publish_at' => 'datetime',
        'seo' => 'array',
        'hero_metadata' => 'array',
        'structured_content' => 'array',
    ];

    protected static function booted(): void
    {
        static::saving(function (BlogPost $post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }

            if (empty($post->reading_time)) {
                $post->reading_time = $post->calculateReadingTime();
            }

            if ($post->is_published && empty($post->published_at)) {
                $post->published_at = now();
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'category_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(BlogTag::class, 'blog_post_tag')
            ->withTimestamps()
            ->withPivot('display_order')
            ->orderBy('blog_post_tag.display_order');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeFeatured($query)
    {
        return $query->published()->where('is_featured', true);
    }

    public function markAsPublished(): void
    {
        $this->is_published = true;
        $this->published_at = $this->published_at ?? now();
    }

    public function incrementViews(): void
    {
        $this->increment('views');
    }

    public function calculateReadingTime(): int
    {
        $wordCount = str_word_count(strip_tags($this->content ?? ''));

        return (int) max(1, ceil($wordCount / 200));
    }
}

