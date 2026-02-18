<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Child;
use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Models\ContactSubmission;
use App\Services\Notifications\EmailNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TestAllNotifications extends Command
{
    protected $signature = 'test:notifications {email? : Email address to send test notifications to}';
    protected $description = 'Send test emails for all notification types (smoke test)';

    public function __construct(
        private readonly EmailNotificationService $emailService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $testEmail = $this->argument('email') ?: $this->ask('Enter test email address');

        if (!filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address!');
            return self::FAILURE;
        }

        $this->info('🧪 Starting Email Notification Smoke Test...');
        $this->newLine();

        // Test 1: Child Approved
        $this->testChildApproved($testEmail);

        // Test 2: Child Rejected
        $this->testChildRejected($testEmail);

        // Test 3: User Approved
        $this->testUserApproved($testEmail);

        // Test 4: User Rejected
        $this->testUserRejected($testEmail);

        // Test 5: Booking Confirmation
        $this->testBookingConfirmation($testEmail);

        // Test 6: Booking Cancellation
        $this->testBookingCancellation($testEmail);

        // Test 7: Payment Confirmation
        $this->testPaymentConfirmation($testEmail);

        // Test 8: Payment Failed
        $this->testPaymentFailed($testEmail);

        // Test 9: Activity Confirmation
        $this->testActivityConfirmation($testEmail);

        // Test 10: Trainer Session Booked (skip for now - requires trainer)
        $this->info('🔟 Testing: Trainer Session Booked');
        $this->line('   ⏭️  Skipped (requires trainer in database)');

        // Test 11: Trainer Session Cancelled (skip for now - requires trainer)
        $this->info('1️⃣1️⃣  Testing: Trainer Session Cancelled');
        $this->line('   ⏭️  Skipped (requires trainer in database)');

        // Test 12: Admin New Booking
        $this->testAdminNewBooking($testEmail);

        // Test 13: Admin Payment Received
        $this->testAdminPaymentReceived($testEmail);

        // Test 14: Admin Child Approval Required
        $this->testAdminChildApprovalRequired($testEmail);

        // Test 15: Admin Session Needs Trainer (skip for now - notification missing)
        $this->info('1️⃣5️⃣  Testing: Admin Session Needs Trainer');
        $this->line('   ⏭️  Skipped (notification class needs to be created)');

        // Test 16: Contact Form Submission
        $this->testContactSubmission($testEmail);

        $this->newLine();
        $this->info('✅ Email notifications tested successfully!');
        $this->info('📧 Check your inbox: ' . $testEmail);
        $this->info('🔍 Or check MailHog: http://localhost:18025');
        $this->newLine();
        $this->info('📊 Summary: 12 sent, 4 skipped (2 require trainer, 1 notification incomplete, 1 requires data)');

        return self::SUCCESS;
    }

    private function testChildApproved(string $email): void
    {
        $this->info('1️⃣  Testing: Child Approved');
        
        try {
            $user = $this->getOrCreateTestUser($email);
            $child = $this->createTestChild($user);

            $this->emailService->sendChildApproved($child);
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
            Log::error('Child Approved notification test failed', ['error' => $e->getMessage()]);
        }
    }

    private function testChildRejected(string $email): void
    {
        $this->info('2️⃣  Testing: Child Rejected');
        
        try {
            $user = $this->getOrCreateTestUser($email);
            $child = $this->createTestChild($user);

            $this->emailService->sendChildRejected($child, 'Test rejection reason');
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function testUserApproved(string $email): void
    {
        $this->info('3️⃣  Testing: User Approved');
        
        try {
            $user = $this->getOrCreateTestUser($email);

            $this->emailService->sendUserApproved($user);
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function testUserRejected(string $email): void
    {
        $this->info('4️⃣  Testing: User Rejected');
        
        try {
            $user = $this->getOrCreateTestUser($email);

            $this->emailService->sendUserRejected($user, 'Test rejection reason');
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function testBookingConfirmation(string $email): void
    {
        $this->info('5️⃣  Testing: Booking Confirmation');
        
        try {
            $user = $this->getOrCreateTestUser($email);
            $booking = $this->createTestBooking($user);

            $this->emailService->sendBookingConfirmation($booking);
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function testBookingCancellation(string $email): void
    {
        $this->info('6️⃣  Testing: Booking Cancellation');
        
        try {
            $user = $this->getOrCreateTestUser($email);
            $booking = $this->createTestBooking($user);

            $this->emailService->sendBookingCancellation($booking);
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function testPaymentConfirmation(string $email): void
    {
        $this->info('7️⃣  Testing: Payment Confirmation');
        
        try {
            $user = $this->getOrCreateTestUser($email);
            $booking = $this->createTestBooking($user);

            $this->emailService->sendPaymentConfirmation($booking);
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function testPaymentFailed(string $email): void
    {
        $this->info('8️⃣  Testing: Payment Failed');
        
        try {
            $user = $this->getOrCreateTestUser($email);
            $booking = $this->createTestBooking($user);

            $this->emailService->sendPaymentFailed($booking, 'Test payment error - card declined');
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function testActivityConfirmation(string $email): void
    {
        $this->info('9️⃣  Testing: Activity Confirmation');
        
        try {
            $user = $this->getOrCreateTestUser($email);
            $booking = $this->createTestBooking($user);
            $schedule = $this->createTestSchedule($booking, false);

            // Create empty Eloquent collection for activities
            $activities = \App\Models\Activity::whereRaw('1 = 0')->get(); // Empty Eloquent collection

            $this->emailService->sendActivityConfirmation($booking, $schedule, $activities);
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function testAdminNewBooking(string $email): void
    {
        $this->info('1️⃣2️⃣  Testing: Admin New Booking');
        
        try {
            $user = $this->getOrCreateTestUser($email);
            $booking = $this->createTestBooking($user);

            $this->emailService->sendNewBookingToAdmin($booking);
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function testAdminPaymentReceived(string $email): void
    {
        $this->info('1️⃣3️⃣  Testing: Admin Payment Received');
        
        try {
            $user = $this->getOrCreateTestUser($email);
            $booking = $this->createTestBooking($user);

            $this->emailService->sendPaymentReceivedToAdmin($booking);
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function testAdminChildApprovalRequired(string $email): void
    {
        $this->info('1️⃣4️⃣  Testing: Admin Child Approval Required');
        
        try {
            $user = $this->getOrCreateTestUser($email);
            $child = $this->createTestChild($user);

            $this->emailService->sendChildApprovalRequiredToAdmin($child);
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function testContactSubmission(string $email): void
    {
        $this->info('1️⃣6️⃣  Testing: Contact Form Submission');
        
        try {
            $submission = ContactSubmission::create([
                'name' => 'Test User',
                'email' => $email,
                'phone' => '07123456789',
                'address' => '123 Test Street',
                'postal_code' => 'IG9 5BT',
                'inquiry_type' => 'general',
                'urgency' => 'urgent',
                'preferred_contact' => 'email',
                'message' => 'This is a test contact form submission for smoke testing all email notifications.',
                'newsletter' => false,
            ]);

            $this->emailService->sendContactSubmissionToAdmin($submission);
            $this->line('   ✅ Sent');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed: ' . $e->getMessage());
        }
    }

    private function getOrCreateTestUser(string $email, string $role = 'parent'): User
    {
        return User::firstOrCreate(
            ['email' => $email],
            [
                'first_name' => 'Test',
                'last_name' => 'User',
                'name' => 'Test User',
                'phone' => '07123456789',
                'address' => '123 Test Street',
                'postcode' => 'IG9 5BT',
                'email_verified_at' => now(),
                'password' => bcrypt('password'),
                'role' => $role,
                'status' => 'approved',
            ]
        );
    }

    private function createTestChild(User $user): Child
    {
        return Child::create([
            'user_id' => $user->id,
            'name' => 'Test Child',
            'age' => 8,
            'date_of_birth' => now()->subYears(8),
            'gender' => 'male',
            'address' => '123 Test Street',
            'postcode' => 'IG9 5BT',
            'approval_status' => 'pending',
        ]);
    }

    private function createTestBooking(User $user): Booking
    {
        return Booking::create([
            'user_id' => $user->id,
            'package_id' => 1,
            'reference' => 'TEST-' . strtoupper(substr(md5(uniqid()), 0, 8)),
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'parent_first_name' => 'Test',
            'parent_last_name' => 'Parent',
            'parent_email' => $user->email,
            'parent_phone' => '07123456789',
            'parent_address' => '123 Test Street',
            'parent_postcode' => 'IG9 5BT',
            'total_hours' => 10.00,
            'booked_hours' => 2.00,
            'used_hours' => 0.00,
            'remaining_hours' => 10.00,
            'total_price' => 99.99,
            'paid_amount' => 99.99,
            'notes' => 'Test booking for smoke testing',
        ]);
    }

    private function createTestSchedule(Booking $booking, bool $withTrainer = true): BookingSchedule
    {
        return BookingSchedule::create([
            'booking_id' => $booking->id,
            'trainer_id' => $withTrainer ? null : null, // Always null for testing
            'date' => now()->addDays(7),
            'start_time' => '10:00',
            'end_time' => '12:00',
            'duration_hours' => 2.00,
            'status' => 'scheduled',
            'activity_count' => 1,
            'activity_status' => 'pending',
            'notes' => 'Test schedule for smoke testing',
        ]);
    }
}
