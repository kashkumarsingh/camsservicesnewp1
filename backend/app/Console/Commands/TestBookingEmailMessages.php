<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Notifications\AdminNewBookingNotification;
use App\Notifications\BookingConfirmationNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

/**
 * Test Booking Email Messages
 * 
 * Purpose: Tests that booking emails show correct messages based on payment status
 * Usage: php artisan test:booking-email-messages
 * Location: backend/app/Console/Commands/TestBookingEmailMessages.php
 */
class TestBookingEmailMessages extends Command
{
    protected $signature = 'test:booking-email-messages {--booking-id= : Specific booking ID to test}';
    protected $description = 'Test booking email messages (PAID vs PENDING)';

    public function handle(): int
    {
        $this->info('🧪 Testing Booking Email Messages...');
        $this->newLine();

        // Get booking
        $bookingId = $this->option('booking-id');
        $booking = $bookingId 
            ? Booking::find($bookingId) 
            : Booking::latest()->first();

        if (!$booking) {
            $this->error('❌ No booking found. Create a booking first.');
            return 1;
        }

        $this->line('📦 Booking Details:');
        $this->line('  ID: ' . $booking->id);
        $this->line('  Reference: ' . $booking->reference);
        $this->line('  Status: ' . $booking->status);
        $this->line('  Payment Status: ' . $booking->payment_status);
        $this->line('  Parent Email: ' . $booking->parent_email);
        $this->newLine();

        // Determine expected message
        $isConfirmedAndPaid = $booking->status === 'confirmed' && $booking->payment_status === 'paid';
        
        if ($isConfirmedAndPaid) {
            $this->info('✅ Status: CONFIRMED & PAID');
            $this->newLine();
            $this->line('📧 Expected Parent Email Message:');
            $this->line('  🎉 Great news! Your booking for ' . $booking->package->name . ' is confirmed and your payment has been received.');
            $this->line('  You\'re all set! Your package is ready to use.');
            $this->newLine();
            $this->line('📧 Expected Admin Email Message:');
            $this->line('  ✅ Payment Received! A new booking has been confirmed and payment has been received.');
            $this->line('  Action Required: Assign trainers and schedule sessions for this booking.');
        } else {
            $this->info('⏳ Status: DRAFT or PENDING');
            $this->newLine();
            $this->line('📧 Expected Parent Email Message:');
            $this->line('  Thank you for choosing CAMS Services! We have received your booking request.');
            $this->line('  Our team will review the details and confirm trainer availability shortly.');
            $this->newLine();
            $this->line('📧 Expected Admin Email Message:');
            $this->line('  A new booking has been created and requires your attention.');
        }

        $this->newLine();
        $this->line('🔥 Sending test emails now...');
        $this->newLine();

        try {
            // Send parent email
            Notification::route('mail', $booking->parent_email)
                ->notify(new BookingConfirmationNotification($booking));
            $this->line('  ✅ Parent email sent to: ' . $booking->parent_email);

            // Send admin email
            $adminEmail = config('app.admin_email', 'admin@camsservices.co.uk');
            Notification::route('mail', $adminEmail)
                ->notify(new AdminNewBookingNotification($booking));
            $this->line('  ✅ Admin email sent to: ' . $adminEmail);

            $this->newLine();
            $this->info('✅ Emails sent successfully!');
            $this->newLine();
            $this->line('📝 Check MailHog: http://localhost:8025');
            $this->line('   Verify the email messages match the expected text above.');
        } catch (\Exception $e) {
            $this->error('❌ Failed to send emails: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
