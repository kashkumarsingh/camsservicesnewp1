<?php

namespace App\Jobs;

use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Runs after the HTTP response is sent so the client is not blocked by
 * the revalidation request to Next.js.
 */
class RevalidateTagJob
{
    use Dispatchable;

    public function __construct(
        public string $tag
    ) {}

    public function handle(): void
    {
        $url = config('services.next.revalidate_url');
        $secret = config('services.next.revalidate_secret');

        if (empty($url) || empty($secret)) {
            return;
        }

        try {
            Http::timeout(5)
                ->acceptJson()
                ->post($url, [
                    'secret' => $secret,
                    'tag' => $this->tag,
                ]);
        } catch (\Throwable $throwable) {
            Log::warning('Failed to revalidate Next.js cache tag', [
                'tag' => $this->tag,
                'message' => $throwable->getMessage(),
            ]);
        }
    }
}
