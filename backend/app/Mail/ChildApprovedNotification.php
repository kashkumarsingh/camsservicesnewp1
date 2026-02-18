<?php

namespace App\Mail;

use App\Models\Child;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Child Approved Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification when child is approved
 */
class ChildApprovedNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Child $child
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Child Has Been Approved - CAMS Services',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.approval.child-approved',
            with: [
                'child' => $this->child,
                'parent' => $this->child->user,
            ],
        );
    }
}

