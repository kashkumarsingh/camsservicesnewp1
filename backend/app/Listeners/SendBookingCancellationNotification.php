<?php

namespace App\Listeners;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Events\BookingCancelled;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendBookingCancellationNotification implements ShouldQueue
{
    public function handle(BookingCancelled $event): void
    {
        app(INotificationDispatcher::class)->dispatch(
            NotificationIntentFactory::bookingCancelled($event->booking, $event->reason)
        );
    }
}

