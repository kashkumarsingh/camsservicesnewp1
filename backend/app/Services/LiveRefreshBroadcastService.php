<?php

namespace App\Services;

use App\Events\LiveRefreshContextsUpdated;
use App\Http\Controllers\Api\LiveRefreshController;

/**
 * Dispatches live-refresh broadcast events so the Next.js frontend (Echo) can
 * refetch when data changes, without waiting for the next poll.
 *
 * When Laravel Reverb/Pusher is configured (BROADCAST_CONNECTION=reverb/pusher),
 * subscribers to private channels receive LiveRefreshContextsUpdated and run
 * the same refetch logic as the polling path. When broadcasting is disabled
 * (log/null), the event is no-op.
 *
 * Context keys must match LiveRefreshController::CONTEXT_* and frontend
 * LIVE_REFRESH_CONTEXTS: notifications, bookings, children,
 * trainer_schedules, trainer_availability.
 */
class LiveRefreshBroadcastService
{
    /**
     * Notify given users (and optionally all admins) that one or more contexts changed.
     *
     * @param  array<int, string>  $contexts  e.g. ['notifications', 'bookings']
     * @param  array<int, int>  $userIds  User IDs to notify (each gets private channel live-refresh.{id})
     * @param  bool  $notifyAdmins  If true, also broadcast to live-refresh.admin (all admins)
     */
    public static function notify(array $contexts, array $userIds = [], bool $notifyAdmins = false): void
    {
        $contexts = array_values(array_unique(array_intersect($contexts, [
            LiveRefreshController::CONTEXT_NOTIFICATIONS,
            LiveRefreshController::CONTEXT_BOOKINGS,
            LiveRefreshController::CONTEXT_CHILDREN,
            LiveRefreshController::CONTEXT_TRAINER_SCHEDULES,
            LiveRefreshController::CONTEXT_TRAINER_AVAILABILITY,
        ])));
        if ($contexts === []) {
            return;
        }

        LiveRefreshContextsUpdated::dispatch($contexts, $userIds, $notifyAdmins);
    }
}
