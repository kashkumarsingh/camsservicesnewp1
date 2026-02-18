<?php

namespace App\Listeners;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Events\PaymentCompleted;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * SendAdminPaymentReceivedNotification Listener
 *
 * Uses central notification dispatcher.
 */
class SendAdminPaymentReceivedNotification implements ShouldQueue
{
    public function handle(PaymentCompleted $event): void
    {
        app(INotificationDispatcher::class)->dispatch(
            NotificationIntentFactory::paymentReceivedToAdmin($event->booking)
        );
    }
}
