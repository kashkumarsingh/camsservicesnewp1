<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperationalDocument extends Model
{
    public const CATEGORY_SAFEGUARDING = 'safeguarding';

    public const CATEGORY_TRANSPORT = 'transport';

    public const CATEGORY_HR = 'hr';

    public const CATEGORY_OPERATIONS = 'operations';

    public const CATEGORY_LEGAL = 'legal';

    public const AUDIENCE_TRAINER = 'trainer';

    public const AUDIENCE_ADMIN = 'admin';

    public const AUDIENCE_ALL = 'all';

    protected $fillable = [
        'slug',
        'title',
        'category',
        'audience',
        'storage_path',
        'external_url',
        'file_name',
        'mime_type',
        'version',
        'is_published',
        'internal_only',
        'uploaded_by',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'internal_only' => 'boolean',
    ];

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function visibleToTrainer(): bool
    {
        if (! $this->is_published || ! $this->internal_only) {
            return false;
        }

        return in_array($this->audience, [self::AUDIENCE_TRAINER, self::AUDIENCE_ALL], true);
    }
}
