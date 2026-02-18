<?php

namespace App\Domain\Notifications;

/**
 * Value object representing a single notification to be dispatched.
 * All application code that needs to notify users goes through this intent;
 * the central dispatcher resolves channels, deduplication, and delivery.
 */
final readonly class NotificationIntent
{
    public function __construct(
        public string $intentType,
        public string $entityType,
        public string|int $entityId,
        public NotificationRecipientSet $recipients,
        public array $payload = [],
        public ?string $entityKey = null,
    ) {
    }

    /**
     * Unique key for deduplication (same intent + entity + recipient scope).
     */
    public function deduplicationKey(): string
    {
        $key = $this->entityKey ?? "{$this->entityType}:{$this->entityId}";
        return "{$this->intentType}:{$key}";
    }
}
