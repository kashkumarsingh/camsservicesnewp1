<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * User Rejected Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification when user is rejected
 */
class UserRejectedNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $user,
        public string $rejectionReason
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'CAMS Services Account Registration Update',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.approval.user-rejected',
            with: [
                'user' => $this->user,
                'rejectionReason' => $this->rejectionReason,
            ],
        );
    }
}

