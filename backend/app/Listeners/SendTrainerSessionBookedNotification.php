<?php

namespace App\Listeners;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Events\SessionBooked;
use App\Models\BookingSchedule;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * SendTrainerSessionBookedNotification Listener
 *
 * Uses central notification dispatcher. Branches: no trainer → admin; pending confirmation → trainer request; else → session booked.
 */
class SendTrainerSessionBookedNotification implements ShouldQueue
{
    public function handle(SessionBooked $event): void
    {
        $schedule = $event->schedule;
        $dispatcher = app(INotificationDispatcher::class);

        if (!$schedule->trainer_id) {
            $dispatcher->dispatch(NotificationIntentFactory::sessionNeedsTrainerToAdmin($schedule));
            return;
        }

        $status = $schedule->trainer_assignment_status ?? null;
        if ($status === BookingSchedule::TRAINER_ASSIGNMENT_PENDING_CONFIRMATION) {
            $dispatcher->dispatch(NotificationIntentFactory::sessionConfirmationRequestToTrainer($schedule));
            return;
        }

        $dispatcher->dispatch(NotificationIntentFactory::sessionBookedToTrainer($schedule));
    }
}
