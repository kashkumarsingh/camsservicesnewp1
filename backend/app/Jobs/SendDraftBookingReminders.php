<?php

namespace App\Jobs;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Models\Booking;
use App\Services\Notifications\NotificationIntentFactory;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Send Draft Booking Reminders Job
 *
 * Purpose: Send reminder emails to parents who abandoned booking (30m, 2h, 24h, 72h) via central dispatcher.
 * Scheduled: Every 15 minutes.
 */
class SendDraftBookingReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(INotificationDispatcher $dispatcher): void
    {
        $now = Carbon::now();

        Log::info('[Draft Booking Reminders] Starting job', [
            'timestamp' => $now->toDateTimeString(),
        ]);

        $draftBookings = Booking::whereIn('status', ['draft', 'awaiting_payment'])
            ->where('created_at', '<=', $now->copy()->subMinutes(30))
            ->where('created_at', '>=', $now->copy()->subHours(96))
            ->whereNotNull('parent_email')
            ->get();

        Log::info('[Draft Booking Reminders] Found draft bookings', [
            'count' => $draftBookings->count(),
        ]);

        $sent = ['30m' => 0, '2h' => 0, '24h' => 0, '72h' => 0];

        foreach ($draftBookings as $booking) {
            $createdAt = Carbon::parse($booking->created_at);
            $hoursSinceCreation = $now->diffInHours($createdAt);
            $minutesSinceCreation = $now->diffInMinutes($createdAt);
            $lastReminderSent = $booking->last_reminder_sent_at
                ? Carbon::parse($booking->last_reminder_sent_at)
                : null;

            $type = null;
            if ($minutesSinceCreation >= 30 && $minutesSinceCreation < 120
                && (! $lastReminderSent || $lastReminderSent->diffInMinutes($createdAt) < 30)) {
                $type = '30m';
            } elseif ($hoursSinceCreation >= 2 && $hoursSinceCreation < 24
                && (! $lastReminderSent || $lastReminderSent->diffInHours($createdAt) < 2)) {
                $type = '2h';
            } elseif ($hoursSinceCreation >= 24 && $hoursSinceCreation < 72
                && (! $lastReminderSent || $lastReminderSent->diffInHours($createdAt) < 24)) {
                $type = '24h';
            } elseif ($hoursSinceCreation >= 72 && $hoursSinceCreation < 96
                && (! $lastReminderSent || $lastReminderSent->diffInHours($createdAt) < 72)) {
                $type = '72h';
            }

            if ($type === null) {
                continue;
            }

            try {
                $dispatcher->dispatch(NotificationIntentFactory::draftBookingReminder($booking, $type));
                $booking->update([
                    'last_reminder_sent_at' => Carbon::now(),
                    'reminder_count' => ($booking->reminder_count ?? 0) + 1,
                ]);
                $sent[$type]++;
                Log::info('[Draft Booking Reminders] Reminder sent', [
                    'booking_id' => $booking->id,
                    'reference' => $booking->reference,
                    'type' => $type,
                    'email' => $booking->parent_email,
                ]);
            } catch (\Exception $e) {
                Log::error('[Draft Booking Reminders] Failed to send reminder', [
                    'booking_id' => $booking->id,
                    'reference' => $booking->reference,
                    'type' => $type,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('[Draft Booking Reminders] Job completed', [
            'sent_30m' => $sent['30m'],
            'sent_2h' => $sent['2h'],
            'sent_24h' => $sent['24h'],
            'sent_72h' => $sent['72h'],
            'total_sent' => array_sum($sent),
        ]);
    }
}
