<?php

namespace App\Listeners;

use App\Events\ContactSubmissionCreated;
use App\Jobs\SendContactSubmissionNotifications;
use App\Jobs\SendContactSubmissionWebhook;

class QueueContactSubmissionNotifications
{
    /**
     * Handle the event.
     */
    public function handle(ContactSubmissionCreated $event): void
    {
        SendContactSubmissionNotifications::dispatch($event->submission);

        if (config('services.zapier.enabled')) {
            SendContactSubmissionWebhook::dispatch($event->submission);
        }
    }
}

