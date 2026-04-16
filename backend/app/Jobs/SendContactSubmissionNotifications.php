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

/**
 * Contact submission notifications via central dispatcher (email + WhatsApp; dedupe and rate limit there).
 * Not using ShouldBeUnique to avoid "aborted transaction" errors when CACHE_STORE=database: a failed
 * query in the job aborts the PostgreSQL transaction and Laravel's unique lock release then fails.
 * Dedupe is handled by the central notification layer (entity key).
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
    }
}

