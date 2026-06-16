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
        // Send during the request — async queue jobs were not reliably processed on Railway.
        SendContactSubmissionNotifications::dispatchSync($event->submission);

        if (config('services.zapier.enabled')) {
            SendContactSubmissionWebhook::dispatchSync($event->submission);
        }
    }
}

