<?php

namespace App\Contracts\Notifications;

use App\Domain\Notifications\NotificationIntent;

/**
 * One channel (in_app, email, whatsapp) for sending a notification.
 * Called by the central dispatcher after deduplication and rate-limit checks.
 */
interface INotificationChannel
{
    public function send(NotificationIntent $intent): void;

    /**
     * Channel identifier for config and logging (in_app, email, whatsapp).
     */
    public function channelName(): string;
}
