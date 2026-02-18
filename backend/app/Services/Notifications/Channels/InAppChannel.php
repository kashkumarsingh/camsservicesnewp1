<?php

namespace App\Services\Notifications\Channels;

use App\Contracts\Notifications\INotificationChannel;
use App\Domain\Notifications\NotificationIntent;
use App\Models\NotificationLog;
use App\Models\UserNotification;
use App\Services\Notifications\DashboardNotificationService;
use Illuminate\Support\Facades\Log;

/**
 * In-app (bell) channel. Creates UserNotification records via DashboardNotificationService.
 */
class InAppChannel implements INotificationChannel
{
    public function __construct(
        private readonly DashboardNotificationService $dashboard
    ) {
    }

    public function channelName(): string
    {
        return 'in_app';
    }

    public function send(NotificationIntent $intent): void
    {
        $type = config("notifications.intent_to_user_notification_type.{$intent->intentType}");
        if (!$type) {
            Log::warning('InAppChannel: no user_notification_type for intent', [
                'intent_type' => $intent->intentType,
            ]);
            return;
        }

        $title = $intent->payload['title'] ?? '';
        $message = $intent->payload['message'] ?? '';
        $link = $intent->payload['link'] ?? null;
        $entityKey = $intent->entityKey ?? "{$intent->entityType}:{$intent->entityId}";

        foreach ($intent->recipients->userIds as $userId) {
            try {
                $this->dashboard->notify(
                    $userId,
                    $type,
                    $title,
                    $message,
                    $link,
                    $entityKey
                );
                $this->logSuccess($intent, (int) $userId, null);
            } catch (\Throwable $e) {
                Log::error('InAppChannel send failed', [
                    'user_id' => $userId,
                    'intent_type' => $intent->intentType,
                    'error' => $e->getMessage(),
                ]);
                $this->logFailure($intent, (int) $userId, null, $e->getMessage());
            }
        }
    }

    private function logSuccess(NotificationIntent $intent, int $userId, ?string $recipientIdentifier): void
    {
        NotificationLog::create([
            'intent_type' => $intent->intentType,
            'channel' => NotificationLog::CHANNEL_IN_APP,
            'entity_type' => $intent->entityType,
            'entity_id' => (string) $intent->entityId,
            'user_id' => $userId,
            'recipient_identifier' => $recipientIdentifier,
            'status' => NotificationLog::STATUS_SENT,
            'sent_at' => now(),
        ]);
    }

    private function logFailure(NotificationIntent $intent, int $userId, ?string $recipientIdentifier, string $error): void
    {
        NotificationLog::create([
            'intent_type' => $intent->intentType,
            'channel' => NotificationLog::CHANNEL_IN_APP,
            'entity_type' => $intent->entityType,
            'entity_id' => (string) $intent->entityId,
            'user_id' => $userId,
            'recipient_identifier' => $recipientIdentifier,
            'status' => NotificationLog::STATUS_FAILED,
            'error_message' => $error,
            'sent_at' => now(),
        ]);
    }
}
