<?php

namespace App\Jobs;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Models\ContactSubmission;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Contact submission notifications via central dispatcher (email + WhatsApp; dedupe and rate limit there).
 * Invoked synchronously from QueueContactSubmissionNotifications listener (dispatchSync) so mail is
 * not dependent on a background queue worker on Railway.
 */
class SendContactSubmissionNotifications implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $timeout = 30;
    public int $tries = 3;

    public function __construct(
        public ContactSubmission $submission
    ) {
    }

    public function handle(INotificationDispatcher $dispatcher): void
    {
        $dispatcher->dispatch(NotificationIntentFactory::contactSubmission($this->submission));
        if (filled($this->submission->email)) {
            $dispatcher->dispatch(NotificationIntentFactory::contactSubmissionThankYou($this->submission));
        }

        Log::info('Contact submission notifications sent', [
            'submission_id' => $this->submission->id,
            'email' => $this->submission->email,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Contact submission notifications failed', [
            'submission_id' => $this->submission->id,
            'error' => $exception->getMessage(),
        ]);
    }
}

