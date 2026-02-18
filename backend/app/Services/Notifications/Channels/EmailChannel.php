<?php

namespace App\Services\Notifications\Channels;

use App\Contracts\Notifications\INotificationChannel;
use App\Domain\Notifications\NotificationIntent;
use App\Models\NotificationLog;
use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification as NotificationFacade;

/**
 * Email channel. Resolves Laravel Notification class from config and sends via mail.
 * Subject model is loaded from entity_type + entity_id for queued jobs.
 */
class EmailChannel implements INotificationChannel
{
    public function channelName(): string
    {
        return 'email';
    }

    public function send(NotificationIntent $intent): void
    {
        $mailableClass = config("notifications.intent_to_mailable_class.{$intent->intentType}");
        if ($mailableClass && is_subclass_of($mailableClass, Mailable::class)) {
            $this->sendMailable($intent, $mailableClass);
            return;
        }

        $notificationClass = config("notifications.intent_to_notification_class.{$intent->intentType}");
        if (!$notificationClass || !is_subclass_of($notificationClass, Notification::class)) {
            Log::warning('EmailChannel: no notification/mailable class for intent', [
                'intent_type' => $intent->intentType,
            ]);
            return;
        }

        $subject = $this->resolveSubject($intent);
        if ($subject === null) {
            Log::warning('EmailChannel: could not resolve subject', [
                'intent_type' => $intent->intentType,
                'entity_type' => $intent->entityType,
                'entity_id' => $intent->entityId,
            ]);
            return;
        }

        $notification = new $notificationClass(...$this->notificationConstructorArgs($notificationClass, $subject, $intent));

        $sentUserIds = [];
        foreach ($intent->recipients->userIds as $userId) {
            $user = User::find($userId);
            if (!$user || blank($user->email)) {
                continue;
            }
            try {
                $user->notify($notification);
                $this->logSuccess($intent, $userId, $user->email);
                $sentUserIds[] = $userId;
            } catch (\Throwable $e) {
                Log::error('EmailChannel send failed (user)', [
                    'user_id' => $userId,
                    'intent_type' => $intent->intentType,
                    'error' => $e->getMessage(),
                ]);
                $this->logFailure($intent, $userId, $user->email, $e->getMessage());
            }
        }

        foreach ($intent->recipients->emails as $email) {
            if (blank($email)) {
                continue;
            }
            try {
                NotificationFacade::route('mail', $email)->notify($notification);
                $this->logSuccess($intent, null, $email);
            } catch (\Throwable $e) {
                Log::error('EmailChannel send failed (email)', [
                    'email' => $email,
                    'intent_type' => $intent->intentType,
                    'error' => $e->getMessage(),
                ]);
                $this->logFailure($intent, null, $email, $e->getMessage());
            }
        }
    }

    private function sendMailable(NotificationIntent $intent, string $mailableClass): void
    {
        $subject = $this->resolveSubject($intent);
        if ($subject === null) {
            Log::warning('EmailChannel: could not resolve subject for mailable', [
                'intent_type' => $intent->intentType,
            ]);
            return;
        }
        $args = array_merge([$subject], $intent->payload['notification_args'] ?? []);
        $mailable = new $mailableClass(...$args);

        foreach ($intent->recipients->userIds as $userId) {
            $user = User::find($userId);
            if (!$user || blank($user->email)) {
                continue;
            }
            try {
                Mail::to($user->email)->send($mailable);
                $this->logSuccess($intent, $userId, $user->email);
            } catch (\Throwable $e) {
                Log::error('EmailChannel mailable send failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
                $this->logFailure($intent, $userId, $user->email, $e->getMessage());
            }
        }
        foreach ($intent->recipients->emails as $email) {
            if (blank($email)) {
                continue;
            }
            try {
                Mail::to($email)->send($mailable);
                $this->logSuccess($intent, null, $email);
            } catch (\Throwable $e) {
                Log::error('EmailChannel mailable send failed', ['email' => $email, 'error' => $e->getMessage()]);
                $this->logFailure($intent, null, $email, $e->getMessage());
            }
        }
    }

    private function resolveSubject(NotificationIntent $intent): ?object
    {
        $modelClass = config("notifications.entity_model.{$intent->entityType}");
        if (!$modelClass || !class_exists($modelClass)) {
            return null;
        }
        return $modelClass::find($intent->entityId);
    }

    /**
     * Build constructor args for the notification. First arg is the subject model;
     * optional payload['notification_args'] are the remaining constructor args (e.g. reason, loginEmail).
     */
    private function notificationConstructorArgs(string $notificationClass, object $subject, NotificationIntent $intent): array
    {
        $payload = $intent->payload;
        $extra = isset($payload['notification_args']) && is_array($payload['notification_args'])
            ? $payload['notification_args']
            : [];
        return array_merge([$subject], $extra);
    }

    private function logSuccess(NotificationIntent $intent, ?int $userId, ?string $recipientIdentifier): void
    {
        NotificationLog::create([
            'intent_type' => $intent->intentType,
            'channel' => NotificationLog::CHANNEL_EMAIL,
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
            'channel' => NotificationLog::CHANNEL_EMAIL,
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
