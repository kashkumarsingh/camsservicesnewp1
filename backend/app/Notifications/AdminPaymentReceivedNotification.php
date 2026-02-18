<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Admin Payment Received Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification to admin when payment is received
 * Location: backend/app/Notifications/AdminPaymentReceivedNotification.php
 */
class AdminPaymentReceivedNotification extends Notification implements ShouldQueue
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
        $packageName = $this->booking->package?->name ?? 'Package';
        $reference = $this->booking->reference;
        $parentName = $this->booking->user?->name 
            ?? $this->booking->user?->first_name . ' ' . $this->booking->user?->last_name
            ?? 'Parent';
        $paidAmount = number_format($this->booking->paid_amount, 2);
        $totalPrice = number_format($this->booking->total_price, 2);

        return (new MailMessage())
            ->subject('Payment Received - Reference ' . $reference)
            ->markdown('mail.admin.payment-received', [
                'booking' => $this->booking,
                'packageName' => $packageName,
                'reference' => $reference,
                'parentName' => $parentName,
                'paidAmount' => $paidAmount,
                'totalPrice' => $totalPrice,
            ]);
    }
}
