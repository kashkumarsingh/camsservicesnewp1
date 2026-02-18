<?php

namespace App\Actions\Booking;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Events\SessionBooked;
use App\Models\BookingSchedule;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * When a trainer declines an auto-assigned session (or marks unavailable): clear trainer, then
 * try next best trainer (up to max attempts). If no other trainer is available or accepts,
 * the session remains unassigned (trainer_id = null) and admin is notified to assign manually.
 */
class ProcessTrainerDeclineAndTryNextAction
{
    private const MAX_ASSIGNMENT_ATTEMPTS = 3;

    public function __construct(
        private readonly AutoAssignTrainerAction $autoAssignTrainerAction,
        private readonly INotificationDispatcher $dispatcher
    ) {
    }

    public function execute(BookingSchedule $schedule, string $reason = ''): void
    {
        $declinedTrainerId = $schedule->trainer_id;
        $attempt = (int) ($schedule->assignment_attempt_count ?? 1);

        DB::transaction(function () use ($schedule, $reason, $declinedTrainerId, &$attempt) {
            $schedule->update([
                'trainer_id' => null,
                'trainer_declined_at' => now(),
                'trainer_decline_reason' => $reason,
                'trainer_assignment_status' => BookingSchedule::TRAINER_ASSIGNMENT_DECLINED,
                'assignment_attempt_count' => $attempt + 1,
            ]);
            $schedule->refresh();
            $attempt = $schedule->assignment_attempt_count;
        });

        Log::info('Trainer declined session, trying next', [
            'schedule_id' => $schedule->id,
            'declined_trainer_id' => $declinedTrainerId,
            'attempt' => $attempt,
            'max' => self::MAX_ASSIGNMENT_ATTEMPTS,
        ]);

        if ($attempt > self::MAX_ASSIGNMENT_ATTEMPTS) {
            // Session stays unassigned; admin notified to assign manually
            $this->dispatcher->dispatch(NotificationIntentFactory::sessionNeedsTrainerToAdmin($schedule));
            Log::info('Max assignment attempts reached, admin notified', ['schedule_id' => $schedule->id]);
            return;
        }

        $nextTrainer = $this->autoAssignTrainerAction->execute(
            $schedule->fresh(),
            [$declinedTrainerId]
        );

        if (!$nextTrainer) {
            // No other trainer available or willing: session stays unassigned; admin notified
            $this->dispatcher->dispatch(NotificationIntentFactory::sessionNeedsTrainerToAdmin($schedule));
            return;
        }

        $autoAccept = (bool) ($nextTrainer->auto_accept_sessions ?? false);
        $schedule->update([
            'trainer_id' => $nextTrainer->id,
            'trainer_declined_at' => null,
            'trainer_decline_reason' => null,
            'trainer_assignment_status' => $autoAccept
                ? BookingSchedule::TRAINER_ASSIGNMENT_CONFIRMED
                : BookingSchedule::TRAINER_ASSIGNMENT_PENDING_CONFIRMATION,
            'trainer_confirmation_requested_at' => $autoAccept ? null : now(),
            'trainer_confirmed_at' => $autoAccept ? now() : null,
            'requires_admin_approval' => !$autoAccept,
        ]);
        $schedule->refresh();

        event(new SessionBooked($schedule));

        Log::info('Next trainer assigned after decline', [
            'schedule_id' => $schedule->id,
            'new_trainer_id' => $nextTrainer->id,
        ]);
    }
}
