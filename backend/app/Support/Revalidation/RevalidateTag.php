<?php

namespace App\Support\Revalidation;

use App\Jobs\RevalidateTagJob;

/**
 * Dispatches revalidation to run after the HTTP response is sent,
 * so the client is not blocked by the Next.js revalidate request.
 */
class RevalidateTag
{
    public static function dispatch(string $tag): void
    {
        RevalidateTagJob::dispatch($tag)->afterResponse();
    }
}


