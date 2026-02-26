<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Page Builder block (hero, features, faq, cta, etc.).
 * Belongs to a Page; payload is JSON (structure depends on block type).
 *
 * @see config/page_blocks.php for allowed types
 * @see PAGE_BUILDER_PHASE_PLAN.md
 */
class PageBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'page_id',
        'sort_order',
        'type',
        'payload',
        'meta',
    ];

    protected $casts = [
        'payload' => 'array',
        'meta' => 'array',
        'sort_order' => 'integer',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Allowed block types (single source: config).
     *
     * @return array<int, string>
     */
    public static function allowedTypes(): array
    {
        return config('page_blocks.block_types', []);
    }
}
