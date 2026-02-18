<?php

namespace App\Events;

use App\Models\BookingSchedule;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

/**
 * ActivityConfirmed Event
 * 
 * Clean Architecture: Domain Event
 * Purpose: Dispatched when trainer confirms activity assignment for a session
 * Location: backend/app/Events/ActivityConfirmed.php
 * 
 * This event is dispatched when:
 * - Trainer confirms activity assignment
 * - Triggers parent notification
 */
class ActivityConfirmed
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public BookingSchedule $schedule,
        public Collection $activities
    ) {
    }
}

