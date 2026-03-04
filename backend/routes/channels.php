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
    $uid = (int) $user->id;
    $requested = (int) $userId;
    return $requested > 0 && $uid === $requested;
}, ['guards' => ['sanctum']]);

Broadcast::channel('live-refresh.admin', function (User $user) {
    // Role column (case-insensitive) or Spatie roles, so both storage paths authorize.
    $role = strtolower(trim((string) ($user->role ?? '')));
    return in_array($role, ['admin', 'super_admin'], true) || $user->hasRole(['admin', 'super_admin']);
}, ['guards' => ['sanctum']]);
