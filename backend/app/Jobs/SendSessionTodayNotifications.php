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
 * Send Session Today Notifications Job
 *
 * Purpose: On session day, send parents a signal (in-app + email) via central dispatcher.
 * Scheduled: Daily at 7:00 AM (e.g. Europe/London).
 */
class SendSessionTodayNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(INotificationDispatcher $dispatcher): void
    {
        $today = Carbon::today()->format('Y-m-d');

        $sessionsToday = BookingSchedule::where('status', 'scheduled')
            ->where('date', $today)
            ->whereNull('session_today_notification_sent_at')
            ->whereHas('booking', function ($query) {
                $query->where('status', 'confirmed');
            })
            ->with(['booking.user', 'booking.children', 'booking.package', 'trainer.user'])
            ->get();

        Log::info('[Session Today] Starting job', [
            'date' => $today,
            'count' => $sessionsToday->count(),
        ]);

        $sent = 0;
        foreach ($sessionsToday as $schedule) {
            $booking = $schedule->booking;
            if (! $booking || (! $booking->user_id && ! $booking->parent_email)) {
                continue;
            }

            $dispatcher->dispatch(NotificationIntentFactory::sessionToday($schedule));
            $schedule->update(['session_today_notification_sent_at' => Carbon::now()]);
            $sent++;
        }

        Log::info('[Session Today] Job completed', ['sent' => $sent]);
    }
}
