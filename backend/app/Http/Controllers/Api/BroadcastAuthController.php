<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
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
        // Use the user already set by auth:sanctum middleware (Bearer token).
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Ensure the request resolves the user when Broadcast runs channel callbacks.
        $request->setUserResolver(fn () => $user);

        // Channel callbacks in routes/channels.php use ['guards' => ['sanctum']], so set the
        // user on the sanctum guard. Otherwise Laravel may resolve auth()->user() from the
        // default guard (web), which is null for API-only requests, and channel auth returns 403.
        Auth::guard('sanctum')->setUser($user);

        return Broadcast::auth($request);
    }
}
