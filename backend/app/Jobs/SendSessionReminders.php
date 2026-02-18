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
 * Send Session Reminders Job
 *
 * Purpose: Send session reminder (24h before) to parents via central dispatcher.
 * Scheduled: Hourly.
 */
class SendSessionReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(INotificationDispatcher $dispatcher): void
    {
        $now = Carbon::now();

        Log::info('[Session Reminders] Starting job', [
            'timestamp' => $now->toDateTimeString(),
        ]);

        $tomorrow = $now->copy()->addHours(24);
        $tomorrowPlus1Hour = $now->copy()->addHours(25);

        $upcomingSessions = BookingSchedule::where('status', 'scheduled')
            ->whereBetween('date', [$tomorrow->format('Y-m-d'), $tomorrowPlus1Hour->format('Y-m-d')])
            ->whereNull('reminder_sent_at')
            ->whereHas('booking', function ($query) {
                $query->where('status', 'confirmed')
                    ->whereNotNull('parent_email');
            })
            ->with(['booking.user', 'booking.children', 'trainer'])
            ->get();

        Log::info('[Session Reminders] Found upcoming sessions', [
            'count' => $upcomingSessions->count(),
            'search_date_from' => $tomorrow->format('Y-m-d'),
            'search_date_to' => $tomorrowPlus1Hour->format('Y-m-d'),
        ]);

        $sent = 0;
        foreach ($upcomingSessions as $schedule) {
            $booking = $schedule->booking;
            if (! $booking || ! $booking->parent_email) {
                Log::warning('[Session Reminders] Schedule has no valid booking or email', [
                    'schedule_id' => $schedule->id,
                ]);
                continue;
            }

            $scheduledDateTime = Carbon::parse($schedule->date . ' ' . $schedule->start_time);
            $hoursUntilSession = $now->diffInHours($scheduledDateTime, false);
            if ($hoursUntilSession < 24 || $hoursUntilSession > 25) {
                continue;
            }

            try {
                $dispatcher->dispatch(NotificationIntentFactory::sessionReminder24h($schedule));
                $schedule->update(['reminder_sent_at' => Carbon::now()]);
                $sent++;
                Log::info('[Session Reminders] Reminder sent', [
                    'schedule_id' => $schedule->id,
                    'booking_id' => $booking->id,
                    'reference' => $booking->reference,
                    'email' => $booking->parent_email,
                ]);
            } catch (\Exception $e) {
                Log::error('[Session Reminders] Failed to send reminder', [
                    'schedule_id' => $schedule->id,
                    'booking_id' => $schedule->booking_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('[Session Reminders] Job completed', ['sent' => $sent]);
    }
}
