<?php

namespace App\Services\Notifications;

use App\Http\Controllers\Api\LiveRefreshController;
use App\Models\User;
use App\Models\UserNotification;
use App\Services\LiveRefreshBroadcastService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Centralised in-app (bell) notification service.
 * Use this whenever something happens that the user should see on their dashboard –
 * booking confirmed, payment received, trainer assigned, child approved, etc.
 * Works for parents, trainers, and admins; one place to create notifications.
 *
 * Deduplication: when $entityKey is provided (e.g. "booking:123", "schedule:456"),
 * we skip creating a duplicate if we already sent the same type for that user+entity
 * within the last DEDUPE_TTL_MINUTES. Prevents duplicate bell notifications for the
 * same real-world event.
 */
class DashboardNotificationService
{
    private const DEDUPE_TTL_MINUTES = 10;

    /**
     * Create an in-app notification for a single user (parent, trainer, or admin).
     * Optionally deduplicate by entity key within a time window.
     *
     * @param User|int $userOrId User model or user id
     * @param string $type One of UserNotification::TYPE_*
     * @param string $title Short title (e.g. "Trainer assigned to your session")
     * @param string $message Body text (e.g. "Gemma Stone has been assigned to Test child's session on …")
     * @param string|null $link Frontend path (e.g. /dashboard/parent)
     * @param string|null $entityKey Optional key for deduplication (e.g. "booking:123", "schedule:456", "child:789"). When set, only one notification per user+type+entity is created within DEDUPE_TTL_MINUTES.
     */
    public function notify(
        User|int $userOrId,
        string $type,
        string $title,
        string $message,
        ?string $link = null,
        ?string $entityKey = null
    ): void {
        $userId = $userOrId instanceof User ? $userOrId->id : $userOrId;
        if (!$userId) {
            Log::warning('DashboardNotificationService::notify skipped: no user id');
            return;
        }

        if ($entityKey !== null && $entityKey !== '') {
            $cacheKey = "dashboard_notif:{$userId}:{$type}:" . md5($entityKey);
            if (Cache::has($cacheKey)) {
                Log::debug('DashboardNotificationService::notify duplicate skipped', [
                    'user_id' => $userId,
                    'type' => $type,
                    'entity_key' => $entityKey,
                ]);
                return;
            }
        }

        try {
            UserNotification::create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'link' => $link,
            ]);
            LiveRefreshBroadcastService::notify(
                [LiveRefreshController::CONTEXT_NOTIFICATIONS],
                [$userId],
                false
            );
            if ($entityKey !== null && $entityKey !== '') {
                $cacheKey = "dashboard_notif:{$userId}:{$type}:" . md5($entityKey);
                Cache::put($cacheKey, true, now()->addMinutes(self::DEDUPE_TTL_MINUTES));
            }
        } catch (\Exception $e) {
            Log::error('DashboardNotificationService::notify failed', [
                'user_id' => $userId,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create the same in-app notification for all admin/super_admin/editor users.
     * Use for new booking, payment received, child approval required, session needs trainer, etc.
     * Pass $entityKey to avoid each admin seeing duplicate in-app notifications for the same event.
     *
     * @param string|null $entityKey Optional (e.g. "booking:123"). Deduplication is per admin user.
     */
    public function notifyAdmins(
        string $type,
        string $title,
        string $message,
        ?string $link = null,
        ?string $entityKey = null
    ): void {
        $userIds = User::whereIn('role', ['admin', 'super_admin', 'editor'])->pluck('id');
        if ($userIds->isEmpty()) {
            Log::warning('DashboardNotificationService::notifyAdmins called but no admin/super_admin/editor users found', [
                'type' => $type,
            ]);
        }
        foreach ($userIds as $userId) {
            $this->notify($userId, $type, $title, $message, $link, $entityKey);
        }
    }
}
