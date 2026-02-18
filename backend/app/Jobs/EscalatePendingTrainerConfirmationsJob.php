<?php

namespace App\Jobs;

use App\Actions\Booking\ProcessTrainerDeclineAndTryNextAction;
use App\Models\BookingSchedule;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Escalate sessions where the assigned trainer did not confirm (or decline) within the configured timeout.
 * Treats each as a "decline": unassigns trainer, tries next available trainer, or notifies admin.
 *
 * Scheduled: e.g. every 6 hours so sessions pending > 24h are escalated.
 *
 * @see config('booking.trainer_confirmation_timeout_hours')
 * @see ProcessTrainerDeclineAndTryNextAction
 */
class EscalatePendingTrainerConfirmationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(ProcessTrainerDeclineAndTryNextAction $processDecline): void
    {
        $timeoutHours = (int) config('booking.trainer_confirmation_timeout_hours', 24);
        $cutoff = Carbon::now()->subHours($timeoutHours);

        $pending = BookingSchedule::where('trainer_assignment_status', BookingSchedule::TRAINER_ASSIGNMENT_PENDING_CONFIRMATION)
            ->whereNotNull('trainer_confirmation_requested_at')
            ->where('trainer_confirmation_requested_at', '<', $cutoff)
            ->where('status', BookingSchedule::STATUS_SCHEDULED)
            ->get();

        if ($pending->isEmpty()) {
            return;
        }

        Log::info('[EscalatePendingTrainerConfirmations] Escalating sessions (no response within {hours}h)', [
            'hours' => $timeoutHours,
            'count' => $pending->count(),
            'schedule_ids' => $pending->pluck('id')->all(),
        ]);

        $reason = "Confirmation timeout (no response within {$timeoutHours} hours).";

        foreach ($pending as $schedule) {
            try {
                $processDecline->execute($schedule->fresh(), $reason);
            } catch (\Throwable $e) {
                Log::error('[EscalatePendingTrainerConfirmations] Failed to escalate schedule', [
                    'schedule_id' => $schedule->id,
                    'message' => $e->getMessage(),
                ]);
            }
        }
    }
}
