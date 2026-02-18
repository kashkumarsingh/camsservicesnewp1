<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * ReviewSource Model
 *
 * Clean Architecture Layer: Domain (Eloquent entity bridging Domain ↔ Infrastructure)
 *
 * Represents a remote review provider configuration (Google, Trustpilot, etc.).
 * Stores credentials, sync cadence, and bookkeeping so that infrastructure jobs
 * can ingest external reviews in a CMS-agnostic manner.
 */
class ReviewSource extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const PROVIDER_GOOGLE = 'google';
    public const PROVIDER_TRUSTPILOT = 'trustpilot';
    public const PROVIDER_OTHER = 'other';

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'provider',
        'display_name',
        'location_id',
        'api_key',
        'api_secret',
        'webhook_secret',
        'sync_frequency_minutes',
        'last_synced_at',
        'last_sync_attempt_at',
        'last_sync_review_count',
        'is_active',
        'settings',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'sync_frequency_minutes' => 'integer',
        'last_synced_at' => 'datetime',
        'last_sync_attempt_at' => 'datetime',
        'last_sync_review_count' => 'integer',
        'is_active' => 'boolean',
        'settings' => 'array',
        'api_key' => 'encrypted',
        'api_secret' => 'encrypted',
        'webhook_secret' => 'encrypted',
        'deleted_at' => 'datetime',
    ];

    /**
     * External reviews ingested from this provider.
     */
    public function externalReviews(): HasMany
    {
        return $this->hasMany(ExternalReview::class);
    }

    /**
     * Determines whether the source is due for another sync attempt.
     */
    public function isDueForSync(CarbonInterface $now): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->last_synced_at === null) {
            return true;
        }

        return $this->last_synced_at->diffInMinutes($now) >= $this->sync_frequency_minutes;
    }
}

