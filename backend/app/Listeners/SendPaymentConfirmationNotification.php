<?php

namespace App\Listeners;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Events\PaymentCompleted;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * SendPaymentConfirmationNotification Listener
 *
 * Uses central notification dispatcher.
 */
class SendPaymentConfirmationNotification implements ShouldQueue
{
    public function handle(PaymentCompleted $event): void
    {
        app(INotificationDispatcher::class)->dispatch(
            NotificationIntentFactory::paymentConfirmed($event->booking)
        );
    }
}
