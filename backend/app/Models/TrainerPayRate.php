<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Trainer Pay Rate (Domain Layer)
 *
 * Pay rate per trainer: hourly or per-session. Used to calculate trainer session pay.
 */
class TrainerPayRate extends Model
{
    public const RATE_TYPE_HOURLY = 'hourly';
    public const RATE_TYPE_PER_SESSION = 'per_session';

    protected $fillable = [
        'trainer_id',
        'rate_type',
        'amount',
        'currency',
        'effective_from',
        'effective_to',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
    ];

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    public function isHourly(): bool
    {
        return $this->rate_type === self::RATE_TYPE_HOURLY;
    }

    public function isPerSession(): bool
    {
        return $this->rate_type === self::RATE_TYPE_PER_SESSION;
    }

    /** Scope: current active rate (effective_to null or in future). */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('effective_to')->orWhere('effective_to', '>=', now()->toDateString());
        })->where(function ($q) {
            $q->whereNull('effective_from')->orWhere('effective_from', '<=', now()->toDateString());
        });
    }
}
