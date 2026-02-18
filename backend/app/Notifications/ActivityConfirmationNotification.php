<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Activity Confirmation Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification when activity/session is confirmed by trainer
 * Location: backend/app/Notifications/ActivityConfirmationNotification.php
 */
class ActivityConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Booking $booking,
        private readonly BookingSchedule $schedule,
        private readonly \Illuminate\Database\Eloquent\Collection $activities
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $packageName = $this->booking->package?->name ?? 'selected package';
        $reference = $this->booking->reference;
        $scheduleDate = $this->schedule->date->format('l, F j, Y');
        $scheduleTime = $this->schedule->start_time . ' - ' . $this->schedule->end_time;
        
        // Get activity names
        $activityNames = $this->activities->map(function ($activity) {
            return $activity->activity?->name ?? 'Activity';
        })->implode(', ');

        // Get participants (children)
        $participants = $this->booking->participants()->with('child')->get();
        $childNames = $participants->map(function ($participant) {
            return $participant->child 
                ? $participant->child->first_name . ' ' . $participant->child->last_name 
                : 'Child';
        })->implode(', ');

        // Get trainer name
        $trainerName = $this->schedule->trainer?->user?->name 
            ?? $this->schedule->trainer?->user?->first_name . ' ' . $this->schedule->trainer?->user?->last_name
            ?? 'Trainer';

        return (new MailMessage())
            ->subject('Session Confirmed - ' . $scheduleDate)
            ->markdown('mail.activity.confirmation', [
                'booking' => $this->booking,
                'schedule' => $this->schedule,
                'packageName' => $packageName,
                'reference' => $reference,
                'scheduleDate' => $scheduleDate,
                'scheduleTime' => $scheduleTime,
                'activityNames' => $activityNames,
                'childNames' => $childNames,
                'trainerName' => $trainerName,
            ]);
    }
}
