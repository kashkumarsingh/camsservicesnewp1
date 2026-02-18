<?php

/**
 * Quick test script to verify Mailtrap email delivery
 * Run: php artisan test:mailtrap
 */

use App\Models\ContactSubmission;
use App\Models\SiteSetting;
use App\Events\ContactSubmissionCreated;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Mail;

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Testing Mailtrap email delivery...\n\n";

// Create a test submission
$submission = ContactSubmission::create([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'phone' => '+44 7123 456789',
    'inquiry_type' => 'general',
    'urgency' => 'exploring',
    'preferred_contact' => 'email',
    'message' => 'This is a test message to verify Mailtrap email delivery is working correctly.',
    'newsletter' => false,
    'status' => 'pending',
    'ip_address' => '127.0.0.1',
]);

echo "✓ Test submission created (ID: {$submission->id})\n";

// Get support emails from site settings
$settings = SiteSetting::instance();
$emails = collect($settings->support_emails ?? [])->pluck('value')->filter()->toArray();

if (empty($emails)) {
    echo "⚠ Warning: No support emails configured in Site Settings.\n";
    echo "   Please add at least one email in Admin dashboard > Site Settings > Support Notifications\n";
    echo "   For testing, using: test@example.com\n";
    $emails = ['test@example.com'];
} else {
    echo "✓ Found " . count($emails) . " support email(s): " . implode(', ', $emails) . "\n";
}

// Dispatch the event (this will queue the notification job)
event(new ContactSubmissionCreated($submission));
echo "✓ Event dispatched\n";

// Process the queue immediately
echo "\nProcessing queue...\n";
Artisan::call('queue:work', ['--once' => true, '--timeout' => 10]);

echo "\n✅ Test complete!\n";
echo "   Check your Mailtrap inbox at: https://mailtrap.io/inboxes\n";
echo "   You should see an email with subject: 'New Contact Request: Test User'\n";

