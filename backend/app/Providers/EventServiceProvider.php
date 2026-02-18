<?php

namespace App\Providers;

use App\Events\ActivityConfirmed;
use App\Events\BookingCancelled;
use App\Events\BookingCreated;
use App\Events\ContactSubmissionCreated;
use App\Events\PaymentCompleted;
use App\Events\PaymentFailed;
use App\Events\SessionBooked;
use App\Listeners\QueueContactSubmissionNotifications;
use App\Listeners\SendActivityConfirmationNotification;
use App\Listeners\SendAdminNewBookingNotification;
use App\Listeners\SendAdminPaymentReceivedNotification;
use App\Listeners\SendAdminSessionBookedNotification;
use App\Listeners\SendBookingCancellationNotification;
use App\Listeners\SendBookingConfirmationNotification;
use App\Listeners\SendPaymentConfirmationNotification;
use App\Listeners\SendPaymentFailedNotification;
use App\Listeners\SendTrainerSessionBookedNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        ContactSubmissionCreated::class => [
            QueueContactSubmissionNotifications::class,
        ],
        BookingCreated::class => [
            SendBookingConfirmationNotification::class,
            SendAdminNewBookingNotification::class,
        ],
        BookingCancelled::class => [
            SendBookingCancellationNotification::class,
        ],
        PaymentCompleted::class => [
            SendPaymentConfirmationNotification::class,
            SendAdminPaymentReceivedNotification::class,
        ],
        PaymentFailed::class => [
            SendPaymentFailedNotification::class,
        ],
        ActivityConfirmed::class => [
            SendActivityConfirmationNotification::class,
        ],
        SessionBooked::class => [
            SendTrainerSessionBookedNotification::class,
            SendAdminSessionBookedNotification::class,
        ],
    ];
}

