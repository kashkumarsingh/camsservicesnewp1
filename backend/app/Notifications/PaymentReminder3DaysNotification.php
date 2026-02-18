<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Payment Reminder (3 Days) Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Second reminder sent 3 days after draft booking creation
 * Location: backend/app/Notifications/PaymentReminder3DaysNotification.php
 */
class PaymentReminder3DaysNotification extends Notification implements ShouldQueue
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
            ->subject('Payment Due in 3 Days - ' . $packageName)
            ->markdown('mail.payment.reminder-3d', [
                'booking' => $this->booking,
                'packageName' => $packageName,
                'reference' => $reference,
                'outstandingAmount' => $outstandingAmount,
            ]);
    }
}
