<?php

namespace App\Services\Notifications;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Domain\Notifications\IntentType;
use App\Domain\Notifications\NotificationIntent;
use App\Domain\Notifications\NotificationRecipientSet;
use App\Models\NotificationLog;
use App\Models\User;
use App\Services\Notifications\Channels\EmailChannel;
use App\Services\Notifications\Channels\InAppChannel;
use App\Services\Notifications\Channels\WhatsAppChannel;
use Illuminate\Support\Facades\Log;

/**
 * Single entry point for all notifications. Applies deduplication, rate limiting,
 * and dispatches to in_app, email, and WhatsApp channels per config.
 */
class CentralNotificationDispatcher implements INotificationDispatcher
{
    public function __construct(
        private readonly InAppChannel $inAppChannel,
        private readonly EmailChannel $emailChannel,
        private readonly WhatsAppChannel $whatsAppChannel,
    ) {
    }

    public function dispatch(NotificationIntent $intent): void
    {
        $channels = config("notifications.channels_per_intent.{$intent->intentType}", []);
        if (empty($channels)) {
            Log::debug('CentralNotificationDispatcher: no channels for intent', [
                'intent_type' => $intent->intentType,
            ]);
            return;
        }

        $dedupeMinutes = IntentType::deduplicationWindowMinutes($intent->intentType);

        foreach ($channels as $channelName) {
            $recipients = $this->recipientsForChannel($intent, $channelName);
            if ($this->hasNoRecipients($recipients, $channelName)) {
                continue;
            }
            $channelIntent = new NotificationIntent(
                intentType: $intent->intentType,
                entityType: $intent->entityType,
                entityId: $intent->entityId,
                recipients: $recipients,
                payload: $intent->payload,
                entityKey: $intent->entityKey,
            );
            $this->dispatchToChannel($channelName, $channelIntent, $dedupeMinutes);
        }
    }

    private function recipientsForChannel(NotificationIntent $intent, string $channelName): NotificationRecipientSet
    {
        $r = $intent->recipients;
        if ($channelName === 'in_app' && !$r->hasUsers() && $r->hasEmails()) {
            $adminIds = User::whereIn('role', ['admin', 'super_admin', 'editor'])->pluck('id')->all();
            return new NotificationRecipientSet(
                userIds: $adminIds,
                emails: $r->emails,
                whatsappNumbers: $r->whatsappNumbers,
            );
        }
        return $r;
    }

    private function hasNoRecipients(NotificationRecipientSet $r, string $channelName): bool
    {
        return match ($channelName) {
            'in_app' => !$r->hasUsers(),
            'email' => !$r->hasUsers() && !$r->hasEmails(),
            'whatsapp' => !$r->hasWhatsApp(),
            default => true,
        };
    }

    private function dispatchToChannel(string $channelName, NotificationIntent $intent, int $dedupeMinutes): void
    {
        $channel = $this->channel($channelName);
        if ($channel === null) {
            return;
        }

        $allowed = $this->filterRecipientsAllowedForChannel($intent, $channelName, $dedupeMinutes);
        if ($this->hasNoRecipients($allowed, $channelName)) {
            return;
        }

        $filteredIntent = new NotificationIntent(
            intentType: $intent->intentType,
            entityType: $intent->entityType,
            entityId: $intent->entityId,
            recipients: $allowed,
            payload: $intent->payload,
            entityKey: $intent->entityKey,
        );
        $channel->send($filteredIntent);
    }

    private function filterRecipientsAllowedForChannel(
        NotificationIntent $intent,
        string $channelName,
        int $dedupeMinutes
    ): NotificationRecipientSet {
        $r = $intent->recipients;
        $userIds = [];
        $emails = [];
        $whatsappNumbers = [];

        if ($channelName === 'in_app') {
            foreach ($r->userIds as $userId) {
                if ($this->shouldSkipDedupe($intent, $channelName, $userId, null, $dedupeMinutes)) {
                    $this->logSkippedDuplicate($intent, $channelName, $userId, null);
                    continue;
                }
                if ($this->shouldSkipRateLimit($userId, $channelName)) {
                    $this->logSkippedRateLimit($intent, $userId, null, $channelName);
                    continue;
                }
                $userIds[] = $userId;
            }
            return new NotificationRecipientSet(userIds: $userIds, emails: $r->emails, whatsappNumbers: $r->whatsappNumbers);
        }

        if ($channelName === 'email') {
            foreach ($r->userIds as $userId) {
                if ($this->shouldSkipDedupe($intent, $channelName, $userId, null, $dedupeMinutes)) {
                    $this->logSkippedDuplicate($intent, $channelName, $userId, null);
                    continue;
                }
                if ($this->shouldSkipRateLimit($userId, $channelName)) {
                    $this->logSkippedRateLimit($intent, $userId, null, $channelName);
                    continue;
                }
                $userIds[] = $userId;
            }
            foreach ($r->emails as $email) {
                if ($this->shouldSkipDedupe($intent, $channelName, null, $email, $dedupeMinutes)) {
                    $this->logSkippedDuplicate($intent, $channelName, null, $email);
                    continue;
                }
                $emails[] = $email;
            }
            return new NotificationRecipientSet(userIds: $userIds, emails: $emails, whatsappNumbers: $r->whatsappNumbers);
        }

        if ($channelName === 'whatsapp') {
            foreach ($r->whatsappNumbers as $number) {
                if ($this->shouldSkipDedupe($intent, $channelName, null, $number, $dedupeMinutes)) {
                    $this->logSkippedDuplicate($intent, $channelName, null, $number);
                    continue;
                }
                $whatsappNumbers[] = $number;
            }
            return new NotificationRecipientSet(userIds: $r->userIds, emails: $r->emails, whatsappNumbers: $whatsappNumbers);
        }

        return $r;
    }

    private function channel(string $name): InAppChannel|EmailChannel|WhatsAppChannel|null
    {
        return match ($name) {
            'in_app' => $this->inAppChannel,
            'email' => $this->emailChannel,
            'whatsapp' => $this->whatsAppChannel,
            default => null,
        };
    }

    private function shouldSkipDedupe(
        NotificationIntent $intent,
        string $channel,
        ?int $userId,
        ?string $recipientIdentifier,
        int $withinMinutes
    ): bool {
        return NotificationLog::wasRecentlySent(
            $intent->intentType,
            $intent->entityType,
            (string) $intent->entityId,
            $channel,
            $userId,
            $recipientIdentifier,
            $withinMinutes
        );
    }

    private function shouldSkipRateLimit(int $userId, string $channelName): bool
    {
        $limit = config("notifications.rate_limits.{$channelName}", 0);
        if ($limit <= 0) {
            return false;
        }
        $count = NotificationLog::countSentToUserInLast24Hours($userId, $channelName);
        return $count >= $limit;
    }

    private function logSkippedDuplicate(
        NotificationIntent $intent,
        string $channel,
        ?int $userId,
        ?string $recipientIdentifier
    ): void {
        NotificationLog::create([
            'intent_type' => $intent->intentType,
            'channel' => $channel,
            'entity_type' => $intent->entityType,
            'entity_id' => (string) $intent->entityId,
            'user_id' => $userId,
            'recipient_identifier' => $recipientIdentifier,
            'status' => NotificationLog::STATUS_SKIPPED_DUPLICATE,
            'sent_at' => now(),
        ]);
    }

    private function logSkippedRateLimit(
        NotificationIntent $intent,
        int $userId,
        ?string $recipientIdentifier,
        string $channel
    ): void {
        NotificationLog::create([
            'intent_type' => $intent->intentType,
            'channel' => $channel,
            'entity_type' => $intent->entityType,
            'entity_id' => (string) $intent->entityId,
            'user_id' => $userId,
            'recipient_identifier' => $recipientIdentifier,
            'status' => NotificationLog::STATUS_SKIPPED_RATE_LIMIT,
            'sent_at' => now(),
        ]);
    }
}
