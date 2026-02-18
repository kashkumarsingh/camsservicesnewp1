<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Admin New Booking Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification to admin when a new booking is created
 * Location: backend/app/Notifications/AdminNewBookingNotification.php
 */
class AdminNewBookingNotification extends Notification implements ShouldQueue
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
        $totalPrice = number_format($this->booking->total_price, 2);
        $paymentStatus = ucfirst($this->booking->payment_status ?? 'pending');
        $bookingStatus = ucfirst($this->booking->status ?? 'draft');

        return (new MailMessage())
            ->subject('New Booking Created - Reference ' . $reference)
            ->markdown('mail.admin.new-booking', [
                'booking' => $this->booking,
                'packageName' => $packageName,
                'reference' => $reference,
                'parentName' => $parentName,
                'totalPrice' => $totalPrice,
                'paymentStatus' => $paymentStatus,
                'bookingStatus' => $bookingStatus,
            ]);
    }
}
