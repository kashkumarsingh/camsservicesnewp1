<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * TrainerNote Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents a note added by a trainer to a booking or schedule
 * Location: backend/app/Models/TrainerNote.php
 */
class TrainerNote extends Model
{
    use HasFactory;

    public const TYPE_GENERAL = 'general';
    public const TYPE_INCIDENT = 'incident';
    public const TYPE_FEEDBACK = 'feedback';
    public const TYPE_ATTENDANCE = 'attendance';

    protected $fillable = [
        'trainer_id',
        'booking_id',
        'booking_schedule_id',
        'note',
        'type',
        'is_private',
    ];

    protected $casts = [
        'is_private' => 'boolean',
    ];

    /**
     * Get the trainer
     */
    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    /**
     * Get the booking
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    /**
     * Get the schedule (if note is for specific schedule)
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(BookingSchedule::class, 'booking_schedule_id');
    }
}

