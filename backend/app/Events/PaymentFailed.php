<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * PaymentFailed Event
 * 
 * Clean Architecture: Domain Event
 * Purpose: Dispatched when payment fails
 * Location: backend/app/Events/PaymentFailed.php
 */
class PaymentFailed
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $error
    ) {
    }
}
