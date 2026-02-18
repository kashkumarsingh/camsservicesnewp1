<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Payment Reminder (Final - 6 Days) Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Final reminder sent 6 days after draft booking creation (24h before expiry)
 * Location: backend/app/Notifications/PaymentReminderFinalNotification.php
 */
class PaymentReminderFinalNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Booking $booking)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $packageName = $this->booking->package?->name ?? 'selected package';
        $reference = $this->booking->reference;
        $outstandingAmount = $this->booking->total_price - ($this->booking->paid_amount ?? 0);

        return (new MailMessage())
            ->subject('Urgent: Payment Overdue - ' . $packageName)
            ->markdown('mail.payment.reminder-final', [
                'booking' => $this->booking,
                'packageName' => $packageName,
                'reference' => $reference,
                'outstandingAmount' => $outstandingAmount,
            ]);
    }
}
