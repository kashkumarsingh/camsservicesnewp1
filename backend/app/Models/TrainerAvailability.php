<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * TrainerAvailability Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents trainer availability patterns (weekly recurring or specific dates)
 * Location: backend/app/Models/TrainerAvailability.php
 * 
 * This model stores trainer availability to enable efficient scheduling queries
 * without complex calculations.
 */
class TrainerAvailability extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'trainer_id',
        'day_of_week',
        'start_time',
        'end_time',
        'specific_date',
        'is_available',
        'reason',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'day_of_week' => 'integer',
        'start_time' => 'string',
        'end_time' => 'string',
        'specific_date' => 'date',
        'is_available' => 'boolean',
    ];

    /**
     * Get the trainer this availability belongs to.
     *
     * @return BelongsTo
     */
    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    /**
     * Scope to get weekly recurring availability.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWeekly($query)
    {
        return $query->whereNull('specific_date');
    }

    /**
     * Scope to get specific date availability.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSpecificDates($query)
    {
        return $query->whereNotNull('specific_date');
    }

    /**
     * Scope to get available slots only.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }
}
