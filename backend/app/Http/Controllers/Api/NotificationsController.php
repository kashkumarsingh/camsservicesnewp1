<?php

namespace App\Http\Controllers\Api;

use App\Helpers\RelativeTimeHelper;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Centralised dashboard notifications (bell) for parents, trainers, and admin.
 * All authenticated users can list and mark their own notifications.
 */
class NotificationsController extends Controller
{
    use BaseApiController;

    /**
     * List notifications for the authenticated user.
     *
     * GET /api/v1/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = min((int) $request->get('per_page', 20), 50);
        $unreadOnly = $request->boolean('unread_only');

        $query = UserNotification::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($unreadOnly) {
            $query->whereNull('read_at');
        }

        $notifications = $query->paginate($perPage);

        $items = $notifications->getCollection()->map(fn (UserNotification $n) => [
            'id' => (string) $n->id,
            'type' => $n->type,
            'category' => UserNotification::categoryForType($n->type),
            'categoryLabel' => UserNotification::categoryLabelForType($n->type),
            'title' => $n->title,
            'message' => $n->message,
            'link' => $n->link,
            'readAt' => $n->read_at?->toIso8601String(),
            'createdAt' => $n->created_at->toIso8601String(),
            'createdAtLabel' => RelativeTimeHelper::label($n->created_at),
        ]);

        return $this->successResponse([
            'notifications' => $items,
            'unreadCount' => UserNotification::where('user_id', $user->id)->whereNull('read_at')->count(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    /**
     * Mark a single notification as read.
     *
     * PATCH /api/v1/notifications/{id}/read
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = UserNotification::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        if (!$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        $updated = $notification->fresh();

        return $this->successResponse([
            'id' => (string) $updated->id,
            'readAt' => $updated->read_at?->toIso8601String(),
        ]);
    }

    /**
     * Mark all notifications as read for the authenticated user.
     *
     * POST /api/v1/notifications/mark-all-read
     */
    public function markAllRead(Request $request): JsonResponse
    {
        UserNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->successResponse(['marked' => true]);
    }
}
