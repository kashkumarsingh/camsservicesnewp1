<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Audit log for every notification dispatched (in_app, email, whatsapp).
 * Used for deduplication and rate limiting by the central notification dispatcher.
 */
class NotificationLog extends Model
{
    public const CHANNEL_IN_APP = 'in_app';
    public const CHANNEL_EMAIL = 'email';
    public const CHANNEL_WHATSAPP = 'whatsapp';

    public const STATUS_SENT = 'sent';
    public const STATUS_FAILED = 'failed';
    public const STATUS_SKIPPED_RATE_LIMIT = 'skipped_rate_limit';
    public const STATUS_SKIPPED_DUPLICATE = 'skipped_duplicate';

    protected $fillable = [
        'intent_type',
        'channel',
        'entity_type',
        'entity_id',
        'user_id',
        'recipient_identifier',
        'status',
        'error_message',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if this intent+entity+channel+recipient was already sent within the given minutes.
     */
    public static function wasRecentlySent(
        string $intentType,
        string $entityType,
        string $entityId,
        string $channel,
        ?int $userId = null,
        ?string $recipientIdentifier = null,
        int $withinMinutes = 60
    ): bool {
        $query = self::query()
            ->where('intent_type', $intentType)
            ->where('entity_type', $entityType)
            ->where('entity_id', (string) $entityId)
            ->where('channel', $channel)
            ->where('sent_at', '>=', now()->subMinutes($withinMinutes))
            ->whereIn('status', [self::STATUS_SENT]);

        if ($userId !== null) {
            $query->where('user_id', $userId);
        } else {
            $query->whereNull('user_id');
        }

        if ($recipientIdentifier !== null) {
            $query->where('recipient_identifier', $recipientIdentifier);
        } else {
            $query->whereNull('recipient_identifier');
        }

        return $query->exists();
    }

    /**
     * Count notifications sent to this user on this channel in the last 24 hours (for rate limiting).
     */
    public static function countSentToUserInLast24Hours(int $userId, string $channel): int
    {
        return self::query()
            ->where('user_id', $userId)
            ->where('channel', $channel)
            ->where('status', self::STATUS_SENT)
            ->where('sent_at', '>=', now()->subDay())
            ->count();
    }
}
