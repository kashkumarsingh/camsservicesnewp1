<?php

namespace App\Services\Notifications;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappNotificationService
{
    public function sendBulk(array $recipients, string $message): void
    {
        $endpoint = config('services.whatsapp.endpoint');
        $token = config('services.whatsapp.token');
        $from = config('services.whatsapp.from');

        if (! $endpoint || ! $token || ! $from) {
            Log::info('WhatsApp notification skipped: missing configuration.');
            return;
        }

        foreach ($recipients as $recipient) {
            $this->send($endpoint, $token, $from, $recipient, $message);
        }
    }

    private function send(string $endpoint, string $token, string $from, string $to, string $message): void
    {
        try {
            Http::withToken($token)
                ->post($endpoint, [
                    'from' => $from,
                    'to' => $to,
                    'message' => $message,
                ])
                ->throw();
        } catch (\Throwable $exception) {
            Log::error('WhatsApp notification failed', [
                'to' => $to,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}

