<?php

namespace App\Domain\Notifications;

/**
 * Represents who should receive a notification: one or more users and/or ad-hoc addresses.
 * Used by the dispatcher to resolve in-app (user_id), email (address), and WhatsApp (number).
 */
final readonly class NotificationRecipientSet
{
    /**
     * @param array<int, int> $userIds User IDs for in-app and for resolving email/phone from User
     * @param array<int, string> $emails Direct email addresses (e.g. admin support_emails)
     * @param array<int, string> $whatsappNumbers Direct WhatsApp numbers (e.g. support_whatsapp_numbers)
     */
    public function __construct(
        public array $userIds = [],
        public array $emails = [],
        public array $whatsappNumbers = [],
    ) {
    }

    public static function forUser(int $userId): self
    {
        return new self(userIds: [$userId]);
    }

    public static function forUsers(array $userIds): self
    {
        return new self(userIds: array_values($userIds));
    }

    public static function forEmails(array $emails): self
    {
        return new self(emails: array_values($emails));
    }

    /**
     * Recipients that are admin/support (no user_id; email and optional WhatsApp only).
     */
    public static function forAdmins(array $emails, array $whatsappNumbers = []): self
    {
        return new self(emails: array_values($emails), whatsappNumbers: array_values($whatsappNumbers));
    }

    public function hasUsers(): bool
    {
        return count($this->userIds) > 0;
    }

    public function hasEmails(): bool
    {
        return count($this->emails) > 0;
    }

    public function hasWhatsApp(): bool
    {
        return count($this->whatsappNumbers) > 0;
    }
}
