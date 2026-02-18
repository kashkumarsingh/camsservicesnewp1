<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * TimeEntry Model
 *
 * Clean Architecture: Domain Layer
 * Purpose: Represents a single clock-in or clock-out event for a trainer session.
 */
class TimeEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainer_id',
        'booking_schedule_id',
        'type',
        'recorded_at',
        'source',
        'notes',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public const TYPE_CLOCK_IN = 'clock_in';
    public const TYPE_CLOCK_OUT = 'clock_out';

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(BookingSchedule::class, 'booking_schedule_id');
    }
}

