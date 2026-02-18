<?php

namespace App\Events;

use App\Models\BookingSchedule;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * SessionBooked Event
 * 
 * Clean Architecture: Domain Event
 * Purpose: Dispatched when a session is booked (by parent or trainer)
 * Location: backend/app/Events/SessionBooked.php
 */
class SessionBooked
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public BookingSchedule $schedule
    ) {
    }
}
