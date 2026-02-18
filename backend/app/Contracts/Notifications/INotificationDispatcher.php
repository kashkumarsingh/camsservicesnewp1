<?php

namespace App\Contracts\Notifications;

use App\Domain\Notifications\NotificationIntent;

/**
 * Single entry point for all application notifications.
 * Dispatcher handles deduplication, rate limiting, logging, and channel delivery (in_app, email, whatsapp).
 */
interface INotificationDispatcher
{
    /**
     * Dispatch a notification intent. May run synchronously or queue a job depending on config.
     * Deduplication and rate limiting are applied before sending.
     */
    public function dispatch(NotificationIntent $intent): void;
}
