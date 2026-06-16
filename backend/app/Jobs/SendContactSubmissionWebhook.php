<?php

namespace App\Jobs;

use App\Models\ContactSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SendContactSubmissionWebhook implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ContactSubmission $submission
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $config = config('services.zapier');

        if (! ($config['enabled'] ?? false) || empty($config['url'])) {
            return;
        }

        $payload = [
            'id' => (string) $this->submission->id,
            'name' => $this->submission->name,
            'email' => $this->submission->email,
            'phone' => $this->submission->phone,
            'childAge' => $this->submission->child_age,
            'inquiryType' => $this->submission->inquiry_type,
            'inquiryDetails' => $this->submission->inquiry_details,
            'urgency' => $this->submission->urgency,
            'preferredContact' => $this->submission->preferred_contact,
            'message' => $this->submission->message,
            'newsletter' => (bool) $this->submission->newsletter,
            'sourcePage' => $this->submission->source_page,
            'submittedAt' => optional($this->submission->created_at)->toIso8601String(),
        ];

        $timestamp = (string) now()->timestamp;
        $headers = [
            'User-Agent' => 'CAMS Services Webhook/' . Str::uuid(),
            'Accept' => 'application/json',
        ];

        if (filled($config['secret'] ?? null)) {
            $signaturePayload = $timestamp . '.' . json_encode($payload);
            $headers['X-CAMS-Timestamp'] = $timestamp;
            $headers['X-CAMS-Signature'] = hash_hmac('sha256', $signaturePayload, $config['secret']);
        }

        try {
            Http::withHeaders($headers)->post($config['url'], $payload)->throw();
        } catch (\Throwable $exception) {
            Log::error('Failed to send contact submission webhook', [
                'error' => $exception->getMessage(),
            ]);
        }
    }
}

