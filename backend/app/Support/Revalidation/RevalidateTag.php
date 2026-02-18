<?php

namespace App\Support\Revalidation;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RevalidateTag
{
    public static function dispatch(string $tag): void
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
                    'tag' => $tag,
                ]);
        } catch (\Throwable $throwable) {
            Log::warning('Failed to revalidate Next.js cache tag', [
                'tag' => $tag,
                'message' => $throwable->getMessage(),
            ]);
        }
    }
}


