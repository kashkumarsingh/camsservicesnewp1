<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Broadcast;

/**
 * Broadcasting auth for Echo private channels (Reverb/Pusher).
 *
 * Uses Sanctum explicitly so channel authorization works when the frontend
 * sends only a Bearer token (no session). The framework BroadcastController
 * uses the default guard, which can fail for API-only requests.
 */
class BroadcastAuthController extends Controller
{
    /**
     * Authenticate the request for channel access.
     *
     * Resolves the user via auth('sanctum') so Bearer token is honoured,
     * then delegates to the broadcaster for channel authorization.
     */
    public function authenticate(Request $request)
    {
        $user = $request->user('sanctum');

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 403);
        }

        // Ensure the request resolves the Sanctum user when Broadcast runs channel callbacks.
        $request->setUserResolver(fn () => $user);

        return Broadcast::auth($request);
    }
}
