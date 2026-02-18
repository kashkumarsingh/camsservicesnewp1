<?php

namespace App\Jobs;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Models\BookingSchedule;
use App\Services\Notifications\NotificationIntentFactory;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Send Session Ending Soon Notifications (30 min before session end)
 *
 * Purpose: Notify parents, admin, and trainers 30 minutes before a session ends.
 * - Trainer: reminder to clock out and complete session notes and activity logs.
 * - Parent: session ending soon, view details and activity logs.
 * - Admin: session ending soon for visibility.
 * Run via scheduler every 15 minutes.
 */
class SendSessionEndingSoonNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(INotificationDispatcher $dispatcher): void
    {
        $now = Carbon::now();
        $windowStart = $now->copy()->addMinutes(28);
        $windowEnd = $now->copy()->addMinutes(32);

        $sessions = BookingSchedule::where('status', 'scheduled')
            ->whereNotNull('date')
            ->whereNotNull('end_time')
            ->whereHas('booking', function ($query) {
                $query->where('status', 'confirmed');
            })
            ->with(['booking.user', 'booking.children', 'trainer.user'])
            ->get();

        $sent = 0;
        foreach ($sessions as $schedule) {
            $sessionEnd = Carbon::parse($schedule->date->format('Y-m-d') . ' ' . $schedule->end_time);
            if (! $sessionEnd->between($windowStart, $windowEnd)) {
                continue;
            }

            if ($schedule->trainer_id && $schedule->relationLoaded('trainer') && $schedule->trainer?->user_id) {
                $dispatcher->dispatch(NotificationIntentFactory::trainerSessionEndingSoon($schedule));
                $sent++;
            }
            $dispatcher->dispatch(NotificationIntentFactory::parentSessionEndingSoon($schedule));
            $sent++;
            $dispatcher->dispatch(NotificationIntentFactory::adminSessionEndingSoon($schedule));
            $sent++;
        }

        if ($sent > 0) {
            Log::info('[Session Ending Soon] Notifications sent', ['count' => $sent]);
        }
    }
}
