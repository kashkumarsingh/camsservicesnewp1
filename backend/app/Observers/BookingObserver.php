<?php

namespace App\Observers;

use App\Http\Controllers\Api\LiveRefreshController;
use App\Models\Booking;
use App\Models\BookingStatusChange;
use App\Services\LiveRefreshBroadcastService;
use Illuminate\Support\Facades\Auth;

class BookingObserver
{
    public function created(Booking $booking): void
    {
        $this->broadcastBookingsRefresh($booking);
    }

    public function updated(Booking $booking): void
    {
        $statusChanged = $booking->wasChanged('status');
        $paymentStatusChanged = $booking->wasChanged('payment_status');

        if ($statusChanged || $paymentStatusChanged) {
            $reason = null;
            if ($statusChanged && $booking->status === Booking::STATUS_CANCELLED) {
                $reason = $booking->cancellation_reason;
            }

            BookingStatusChange::create([
                'booking_id' => $booking->id,
                'old_status' => $booking->getOriginal('status'),
                'new_status' => $booking->status,
                'old_payment_status' => $booking->getOriginal('payment_status'),
                'new_payment_status' => $booking->payment_status,
                'reason' => $reason,
                'changed_by_user_id' => Auth::id(),
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
                'metadata' => [
                    'changes' => array_keys($booking->getChanges()),
                ],
            ]);
        }
        $this->broadcastBookingsRefresh($booking);
    }

    public function deleted(Booking $booking): void
    {
        $this->broadcastBookingsRefresh($booking);
    }

    private function broadcastBookingsRefresh(Booking $booking): void
    {
        $userIds = array_filter([$booking->user_id]);
        $booking->loadMissing(['schedules.trainer']);
        foreach ($booking->schedules as $schedule) {
            if ($schedule->trainer?->user_id) {
                $userIds[] = $schedule->trainer->user_id;
            }
        }
        $userIds = array_values(array_unique(array_filter($userIds)));
        LiveRefreshBroadcastService::notify(
            [LiveRefreshController::CONTEXT_BOOKINGS],
            $userIds,
            true
        );
    }
}

