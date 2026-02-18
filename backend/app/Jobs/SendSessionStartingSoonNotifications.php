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
 * Send Session Starting Soon Notifications (30 min before session start)
 *
 * Purpose: Notify trainers 30 minutes before their session starts
 * (e.g. session at 13:30, notify at 13:00) so they can get ready and clock in.
 * Run via scheduler every 15 minutes.
 */
class SendSessionStartingSoonNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(INotificationDispatcher $dispatcher): void
    {
        $now = Carbon::now();
        $windowStart = $now->copy()->addMinutes(28);
        $windowEnd = $now->copy()->addMinutes(32);

        $sessions = BookingSchedule::where('status', 'scheduled')
            ->whereNotNull('date')
            ->whereNotNull('start_time')
            ->whereNotNull('trainer_id')
            ->whereHas('trainer.user')
            ->whereHas('booking', function ($query) {
                $query->where('status', 'confirmed');
            })
            ->with(['booking.children', 'trainer'])
            ->get();

        $sent = 0;
        foreach ($sessions as $schedule) {
            $sessionStart = Carbon::parse($schedule->date->format('Y-m-d') . ' ' . $schedule->start_time);
            if ($sessionStart->between($windowStart, $windowEnd)) {
                $dispatcher->dispatch(NotificationIntentFactory::trainerSessionStartingSoon($schedule));
                $sent++;
            }
        }

        if ($sent > 0) {
            Log::info('[Session Starting Soon] Notifications sent', ['count' => $sent]);
        }
    }
}
