<?php

use App\Jobs\EscalatePendingTrainerConfirmationsJob;
use App\Jobs\SendDraftBookingReminders;
use App\Jobs\SendPaymentReminders;
use App\Jobs\SendSessionEndingSoonNotifications;
use App\Jobs\SendSessionReminders;
use App\Jobs\SendSessionStartingSoonNotifications;
use App\Jobs\SendSessionTodayNotifications;
use App\Jobs\SyncExternalReviewsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// External Reviews Sync (Every 6 hours)
Schedule::job(new SyncExternalReviewsJob())
    ->name('sync-external-reviews')
    ->everySixHours()
    ->withoutOverlapping();

// Draft Booking Reminders (Every 15 minutes)
// Sends reminder emails to parents who abandoned bookings
// Schedule: 30m, 2h, 24h, 72h after abandonment
Schedule::job(new SendDraftBookingReminders())
    ->name('send-draft-booking-reminders')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->onOneServer(); // Only run on one server if multiple exist

// Payment Reminders (Daily at 9:00 AM)
// Sends payment reminder emails for pending payments
// Schedule: 24h before due, 3 days before due, 7 days after due
Schedule::job(new SendPaymentReminders())
    ->name('send-payment-reminders')
    ->dailyAt('09:00')
    ->timezone('Europe/London')
    ->withoutOverlapping()
    ->onOneServer();

// Session Reminders (Hourly)
// Sends reminder emails 24 hours before scheduled sessions
Schedule::job(new SendSessionReminders())
    ->name('send-session-reminders')
    ->hourly()
    ->withoutOverlapping()
    ->onOneServer();

// Session Today (Daily at 7:00 AM)
// In-app notification + email on the day of the session so parents get a signal
Schedule::job(new SendSessionTodayNotifications())
    ->name('send-session-today-notifications')
    ->dailyAt('07:00')
    ->timezone('Europe/London')
    ->withoutOverlapping()
    ->onOneServer();

// Session Starting Soon (Every 15 minutes)
// Notifies trainers 30 min before session start so they can get ready and clock in
Schedule::job(new SendSessionStartingSoonNotifications())
    ->name('send-session-starting-soon-notifications')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->onOneServer();

// Session Ending Soon (Every 15 minutes)
// Reminds trainers 30 min before session end to clock out and complete notes
Schedule::job(new SendSessionEndingSoonNotifications())
    ->name('send-session-ending-soon-notifications')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->onOneServer();

// Pending trainer confirmation timeout (Hourly)
// Sessions where trainer neither confirmed nor declined within config('booking.trainer_confirmation_timeout_hours')
// are escalated: try next trainer or notify admin (same as decline).
Schedule::job(new EscalatePendingTrainerConfirmationsJob())
    ->name('escalate-pending-trainer-confirmations')
    ->hourly()
    ->withoutOverlapping()
    ->onOneServer();


