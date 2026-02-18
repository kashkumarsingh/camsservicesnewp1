<?php

namespace App\Listeners;

use App\Events\ActivityConfirmed;
use App\Services\Notifications\EmailNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * SendActivityConfirmationNotification Listener
 * 
 * Clean Architecture: Application Layer (Event Handler)
 * Purpose: Sends notification to parent when activity is confirmed
 * Location: backend/app/Listeners/SendActivityConfirmationNotification.php
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

        // Load activity relationship if not already loaded
        $activities->load('activity');

        // Send notification via centralized service
        app(EmailNotificationService::class)
            ->sendActivityConfirmation($booking, $schedule, $activities);
    }
}

