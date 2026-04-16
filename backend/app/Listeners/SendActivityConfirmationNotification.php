<?php

namespace App\Listeners;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Events\ActivityConfirmed;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * SendActivityConfirmationNotification Listener
 *
 * Clean Architecture: Application Layer (Event Handler)
 * Purpose: Sends notification to parent when activity is confirmed via central dispatcher.
 */
class SendActivityConfirmationNotification implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(ActivityConfirmed $event): void
    {
        $schedule = $event->schedule;
        $activities = $event->activities;
        $booking = $schedule->booking;

        $activities->load('activity');

        app(INotificationDispatcher::class)->dispatch(
            NotificationIntentFactory::activityConfirmed($booking, $schedule, $activities)
        );
    }
}

