<?php

namespace App\Listeners;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Events\BookingCreated;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * SendAdminNewBookingNotification Listener
 *
 * Uses central notification dispatcher (deduplication and rate limiting handled there).
 */
class SendAdminNewBookingNotification implements ShouldQueue
{
    public function uniqueId(): string
    {
        return static::class;
    }

    public function handle(BookingCreated $event): void
    {
        $booking = $event->booking;

        if ($booking->status !== 'confirmed') {
            Log::info('Skipping admin new booking notification (status not confirmed)', [
                'booking_id' => $booking->id,
                'status' => $booking->status,
            ]);
            return;
        }

        app(INotificationDispatcher::class)->dispatch(
            NotificationIntentFactory::newBookingToAdmin($booking)
        );
    }
}
