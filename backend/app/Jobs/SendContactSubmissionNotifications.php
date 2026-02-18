<?php

namespace App\Jobs;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Models\ContactSubmission;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Contact submission notifications via central dispatcher (email + WhatsApp; dedupe and rate limit there).
 */
class SendContactSubmissionNotifications implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $timeout = 30;
    public int $tries = 3;

    public function uniqueId(): string
    {
        return 'contact-submission-notifications-' . $this->submission->id;
    }

    public int $uniqueFor = 3600;

    public function __construct(
        public ContactSubmission $submission
    ) {
    }

    public function handle(INotificationDispatcher $dispatcher): void
    {
        $dispatcher->dispatch(NotificationIntentFactory::contactSubmission($this->submission));
    }
}

