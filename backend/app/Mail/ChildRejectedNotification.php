<?php

namespace App\Mail;

use App\Models\Child;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Child Rejected Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification when child is rejected
 */
class ChildRejectedNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Child $child,
        public string $rejectionReason
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Child Registration Update - CAMS Services',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.approval.child-rejected',
            with: [
                'child' => $this->child,
                'parent' => $this->child->user,
                'rejectionReason' => $this->rejectionReason,
            ],
        );
    }
}

