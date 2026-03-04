<?php

namespace App\Http\Controllers\Api;

use App\Support\ApiResponseHelper;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;

/**
 * Broadcasting auth for Echo private channels (Reverb/Pusher).
 *
 * Uses Sanctum explicitly so channel authorization works when the frontend
 * sends only a Bearer token (no session). CSRF is not required for API
 * routes (see bootstrap/app.php validateCsrfTokens except api/*).
 *
 * @see https://laravel.com/docs/12.x/broadcasting#authorizing-channels
 */
class BroadcastAuthController extends Controller
{
    /**
     * Authenticate the request for channel access.
     *
     * Step 1: Resolve user via Sanctum (Bearer token). Return 401 if unauthenticated.
     * Step 2: Set user on request and sanctum guard so channel callbacks receive it.
     * Step 3: Delegate to Broadcast::auth() for channel authorization (returns 403 if denied).
     */
    public function authenticate(Request $request)
    {
        // Step 1: Explicitly resolve user from Sanctum guard (Bearer token in Authorization header).
        $user = Auth::guard('sanctum')->user();
        if (! $user) {
            return ApiResponseHelper::unauthorizedResponse('Unauthenticated.', $request);
        }

        // Normalise auth params: Pusher protocol expects channel_name and socket_id; some clients send camelCase.
        if ($request->has('channelName') && ! $request->has('channel_name')) {
            $request->merge(['channel_name' => $request->input('channelName')]);
        }
        if ($request->has('socketId') && ! $request->has('socket_id')) {
            $request->merge(['socket_id' => $request->input('socketId')]);
        }

        // Step 2: Ensure Broadcast channel callbacks receive this user. The Broadcast manager
        // may resolve the user via $request->user() or auth()->user(); set both so 403 is avoided.
        $request->setUserResolver(fn () => $user);
        Auth::guard('sanctum')->setUser($user);
        $previousGuard = Auth::getDefaultDriver();
        Auth::setDefaultDriver('sanctum');

        try {
            // Step 3: Laravel validates channel_name/socket_id and runs routes/channels.php callbacks.
            return Broadcast::auth($request);
        } finally {
            Auth::setDefaultDriver($previousGuard);
        }
    }
}
