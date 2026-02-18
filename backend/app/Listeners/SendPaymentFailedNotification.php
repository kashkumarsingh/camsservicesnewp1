<?php

namespace App\Listeners;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Events\PaymentFailed;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * SendPaymentFailedNotification Listener
 *
 * Uses central notification dispatcher.
 */
class SendPaymentFailedNotification implements ShouldQueue
{
    public function handle(PaymentFailed $event): void
    {
        app(INotificationDispatcher::class)->dispatch(
            NotificationIntentFactory::paymentFailed($event->booking, $event->error)
        );
    }
}
