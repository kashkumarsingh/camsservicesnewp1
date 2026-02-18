<?php

namespace App\Listeners;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Events\SessionBooked;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * SendAdminSessionBookedNotification Listener
 *
 * Uses central notification dispatcher (deduplication and rate limiting handled there).
 */
class SendAdminSessionBookedNotification implements ShouldQueue
{
    public function uniqueId(): string
    {
        return static::class;
    }

    public function handle(SessionBooked $event): void
    {
        $schedule = $event->schedule;
        $booking = $schedule->booking;

        if (in_array($schedule->status, ['cancelled', 'rejected', 'completed'])) {
            Log::info('Skipping admin session booked notification (status not eligible)', [
                'schedule_id' => $schedule->id,
                'status' => $schedule->status,
            ]);
            return;
        }

        app(INotificationDispatcher::class)->dispatch(
            NotificationIntentFactory::sessionBookedToAdmin($schedule)
        );
    }
}
