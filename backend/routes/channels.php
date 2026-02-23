<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels (live-refresh real-time updates)
|--------------------------------------------------------------------------
|
| Used when Laravel Reverb/Pusher is enabled. Private channels require
| the user to be authenticated (Sanctum token). Frontend Echo
| subscribes to these and triggers refetch on LiveRefreshContextsUpdated.
|
*/

Broadcast::channel('live-refresh.{userId}', function (User $user, $userId) {
    return (int) $user->id === (int) $userId;
}, ['guards' => ['sanctum']]);

Broadcast::channel('live-refresh.admin', function (User $user) {
    return in_array($user->role ?? '', ['admin', 'super_admin'], true);
}, ['guards' => ['sanctum']]);
