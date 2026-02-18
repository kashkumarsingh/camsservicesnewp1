<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Admin Session Booked Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification to admin when a parent books a new session
 * Location: backend/app/Notifications/AdminSessionBookedNotification.php
 * 
 * Trigger: SessionBooked event via SendAdminSessionBookedNotification listener
 * Recipient: Admin emails from site settings (support_emails)
 * 
 * Provides admin with:
 * - Session details (date, time, duration, activity)
 * - Parent and children information
 * - Trainer assignment status
 * - Booking reference
 * - Quick action link to admin dashboard
 */
class AdminSessionBookedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly BookingSchedule $schedule)
    {
    }

    /**
     * Get the notification's delivery channels
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification
     */
    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->schedule->booking;
        $packageName = $booking?->package?->name ?? 'Package';
        $reference = $booking?->reference ?? 'N/A';
        
        // Get parent name
        $parentName = $booking?->user?->name 
            ?? ($booking?->user?->first_name 
                ? $booking->user->first_name . ' ' . ($booking->user->last_name ?? '')
                : 'Parent');
        
        // Get child names
        $children = $booking?->children ?? collect();
        $childNames = $children->count() > 0 
            ? $children->pluck('name')->join(', ')
            : 'No children';
        
        // Format schedule date and time
        $scheduleDate = $this->schedule->date 
            ? \Carbon\Carbon::parse($this->schedule->date)->format('l, F j, Y')
            : 'Not set';
        
        $scheduleTime = $this->schedule->start_time && $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->start_time)->format('g:i A') . ' - ' . 
              \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : 'Not set';
        
        // Get duration in hours
        $duration = $this->schedule->duration ?? 0;
        $durationText = $duration > 0 ? number_format($duration, 1) . 'h' : 'Not set';
        
        // Get activity names (handle multiple activities or trainer's choice)
        $activities = $this->schedule->activities;
        $activityName = $activities && $activities->count() > 0 
            ? $activities->pluck('name')->join(', ')
            : 'Trainer\'s Choice';
        
        // Get trainer info
        $trainer = $this->schedule->trainer;
        $trainerName = $trainer?->name ?? 'No trainer assigned';
        $needsTrainer = $trainer === null;
        
        // Build subject line
        $subject = $needsTrainer 
            ? '⚠️ New Session Booked (Trainer Needed) - ' . $reference
            : '✅ New Session Booked - ' . $reference;

        // Build admin panel URL
        $adminUrl = config('app.url') . '/admin/booking-schedules/' . $this->schedule->id . '/edit';

        return (new MailMessage())
            ->subject($subject)
            ->markdown('mail.admin.session-booked', [
                'booking' => $booking,
                'schedule' => $this->schedule,
                'packageName' => $packageName,
                'reference' => $reference,
                'parentName' => $parentName,
                'childNames' => $childNames,
                'scheduleDate' => $scheduleDate,
                'scheduleTime' => $scheduleTime,
                'duration' => $durationText,
                'activityName' => $activityName,
                'trainerName' => $trainerName,
                'needsTrainer' => $needsTrainer,
                'adminUrl' => $adminUrl,
            ]);
    }
}
