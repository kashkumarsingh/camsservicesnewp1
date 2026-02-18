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
 * Send Payment Reminders Job
 *
 * Purpose: Send payment reminder emails (24h before, 3d before, 7d after due) via central dispatcher.
 * Auto-cancels bookings 14 days after due and sends cancellation via dispatcher.
 * Scheduled: Daily at 9:00 AM.
 */
class SendPaymentReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(INotificationDispatcher $dispatcher): void
    {
        $now = Carbon::now();

        Log::info('[Payment Reminders] Starting job', [
            'timestamp' => $now->toDateTimeString(),
        ]);

        $pendingPayments = Booking::where('status', 'confirmed')
            ->where('payment_status', 'pending')
            ->whereNotNull('payment_due_date')
            ->whereNotNull('parent_email')
            ->get();

        Log::info('[Payment Reminders] Found bookings with pending payments', [
            'count' => $pendingPayments->count(),
        ]);

        $sent = ['24h_before' => 0, '3d_before' => 0, '7d_after' => 0];

        foreach ($pendingPayments as $booking) {
            $dueDate = Carbon::parse($booking->payment_due_date);
            $daysUntilDue = $now->diffInDays($dueDate, false);
            $lastPaymentReminderType = $booking->last_payment_reminder_type;

            if ($daysUntilDue === 1 && $lastPaymentReminderType !== '24h_before') {
                $this->sendReminder($dispatcher, $booking, '24h_before');
                $sent['24h_before']++;
                continue;
            }
            if ($daysUntilDue === 3 && $lastPaymentReminderType !== '3d_before') {
                $this->sendReminder($dispatcher, $booking, '3d_before');
                $sent['3d_before']++;
                continue;
            }
            if ($daysUntilDue === -7 && $lastPaymentReminderType !== '7d_after') {
                $this->sendReminder($dispatcher, $booking, '7d_after');
                $sent['7d_after']++;
                continue;
            }

            if ($daysUntilDue <= -14 && $booking->status !== 'cancelled') {
                $this->autoCancelBooking($dispatcher, $booking);
            }
        }

        Log::info('[Payment Reminders] Job completed', [
            'sent_24h_before' => $sent['24h_before'],
            'sent_3d_before' => $sent['3d_before'],
            'sent_7d_after' => $sent['7d_after'],
            'total_sent' => array_sum($sent),
        ]);
    }

    private function sendReminder(INotificationDispatcher $dispatcher, Booking $booking, string $type): void
    {
        try {
            $dispatcher->dispatch(NotificationIntentFactory::paymentReminder($booking, $type));
            $booking->update([
                'last_payment_reminder_sent_at' => Carbon::now(),
                'last_payment_reminder_type' => $type,
                'payment_reminder_count' => ($booking->payment_reminder_count ?? 0) + 1,
            ]);
            Log::info('[Payment Reminders] Reminder sent', [
                'booking_id' => $booking->id,
                'reference' => $booking->reference,
                'type' => $type,
                'email' => $booking->parent_email,
                'due_date' => $booking->payment_due_date,
            ]);
        } catch (\Exception $e) {
            Log::error('[Payment Reminders] Failed to send reminder', [
                'booking_id' => $booking->id,
                'reference' => $booking->reference,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function autoCancelBooking(INotificationDispatcher $dispatcher, Booking $booking): void
    {
        try {
            $reason = 'Payment not received within 14 days of due date';
            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => $reason,
                'cancelled_at' => Carbon::now(),
            ]);
            $dispatcher->dispatch(NotificationIntentFactory::bookingCancelled($booking, $reason));
            Log::info('[Payment Reminders] Booking auto-cancelled', [
                'booking_id' => $booking->id,
                'reference' => $booking->reference,
                'due_date' => $booking->payment_due_date,
            ]);
        } catch (\Exception $e) {
            Log::error('[Payment Reminders] Failed to auto-cancel booking', [
                'booking_id' => $booking->id,
                'reference' => $booking->reference,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
