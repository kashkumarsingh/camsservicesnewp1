<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * PaymentCompleted Event
 * 
 * Clean Architecture: Domain Event
 * Purpose: Dispatched when payment is successfully completed
 * Location: backend/app/Events/PaymentCompleted.php
 */
class PaymentCompleted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Booking $booking
    ) {
    }
}
