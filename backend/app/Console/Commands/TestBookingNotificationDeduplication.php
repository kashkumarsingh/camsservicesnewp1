<?php

namespace App\Console\Commands;

use App\Events\BookingCreated;
use App\Models\Booking;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Test Booking Notification Deduplication
 * 
 * Purpose: Tests that booking notifications are only sent once (no duplicates)
 * Usage: php artisan test:booking-notification-deduplication
 * Location: backend/app/Console/Commands/TestBookingNotificationDeduplication.php
 */
class TestBookingNotificationDeduplication extends Command
{
    protected $signature = 'test:booking-notification-deduplication {--booking-id= : Specific booking ID to test}';
    protected $description = 'Test booking notification deduplication (prevents duplicate emails)';

    public function handle(): int
    {
        $this->info('🧪 Testing Booking Notification Deduplication...');
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

        // Fire event 3 times to test deduplication
        $this->info('🔥 Firing BookingCreated event 3 times...');
        $this->newLine();

        for ($i = 1; $i <= 3; $i++) {
            $this->line("  ⏳ Attempt {$i}/3...");
            event(new BookingCreated($booking));
            sleep(1); // Small delay to allow queue processing
        }

        $this->newLine();
        $this->info('✅ Test complete!');
        $this->newLine();
        
        $this->line('📧 Expected Result:');
        if ($booking->status === 'confirmed') {
            $this->line('  ✅ Parent should receive: 1 email (not 3)');
            $this->line('  ✅ Admin should receive: 1 email (not 3)');
        } else {
            $this->line('  ℹ️  No emails sent (booking status: ' . $booking->status . ')');
            $this->line('  ℹ️  Emails only sent for CONFIRMED bookings');
        }
        
        $this->newLine();
        $this->line('📝 Check MailHog: http://localhost:8025');
        
        $this->newLine();
        $this->comment('💡 Tip: If you still see duplicates, wait 5 minutes and try again (cache TTL)');

        return 0;
    }
}
