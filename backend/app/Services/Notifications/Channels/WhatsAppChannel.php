<?php

namespace App\Services\Notifications\Channels;

use App\Contracts\Notifications\INotificationChannel;
use App\Domain\Notifications\NotificationIntent;
use App\Models\NotificationLog;
use App\Services\Notifications\WhatsappNotificationService;
use Illuminate\Support\Facades\Log;

/**
 * WhatsApp channel. Sends via WhatsappNotificationService.
 * Message text must be in payload['whatsapp_message'] or payload['message'].
 */
class WhatsAppChannel implements INotificationChannel
{
    public function __construct(
        private readonly WhatsappNotificationService $whatsapp
    ) {
    }

    public function channelName(): string
    {
        return 'whatsapp';
    }

    public function send(NotificationIntent $intent): void
    {
        $message = $intent->payload['whatsapp_message'] ?? $intent->payload['message'] ?? '';
        if (blank($message)) {
            Log::warning('WhatsAppChannel: no message in payload', [
                'intent_type' => $intent->intentType,
            ]);
            return;
        }

        $numbers = $intent->recipients->whatsappNumbers;
        if (empty($numbers)) {
            return;
        }

        try {
            $this->whatsapp->sendBulk($numbers, $message);
            foreach ($numbers as $number) {
                $this->logSuccess($intent, null, $number);
            }
        } catch (\Throwable $e) {
            Log::error('WhatsAppChannel send failed', [
                'intent_type' => $intent->intentType,
                'error' => $e->getMessage(),
            ]);
            foreach ($numbers as $number) {
                $this->logFailure($intent, null, $number, $e->getMessage());
            }
        }
    }

    private function logSuccess(NotificationIntent $intent, ?int $userId, ?string $recipientIdentifier): void
    {
        NotificationLog::create([
            'intent_type' => $intent->intentType,
            'channel' => NotificationLog::CHANNEL_WHATSAPP,
            'entity_type' => $intent->entityType,
            'entity_id' => (string) $intent->entityId,
            'user_id' => $userId,
            'recipient_identifier' => $recipientIdentifier,
            'status' => NotificationLog::STATUS_SENT,
            'sent_at' => now(),
        ]);
    }

    private function logFailure(NotificationIntent $intent, ?int $userId, ?string $recipientIdentifier, string $error): void
    {
        NotificationLog::create([
            'intent_type' => $intent->intentType,
            'channel' => NotificationLog::CHANNEL_WHATSAPP,
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
