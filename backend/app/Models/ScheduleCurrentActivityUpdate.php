<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One row per "Update what I'm doing now" from the trainer.
 * Used to show past "Currently doing [activity] at [location]" in the Right now tab.
 */
class ScheduleCurrentActivityUpdate extends Model
{
    protected $table = 'schedule_current_activity_updates';

    protected $fillable = [
        'booking_schedule_id',
        'activity_name',
        'location',
    ];

    public function bookingSchedule(): BelongsTo
    {
        return $this->belongsTo(BookingSchedule::class, 'booking_schedule_id');
    }
}
