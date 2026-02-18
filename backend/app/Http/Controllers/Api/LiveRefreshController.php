<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Models\Child;
use App\Models\TrainerAbsenceRequest;
use App\Models\TrainerAvailability;
use App\Models\UserNotification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Centralised live-refresh endpoint for parents, trainers, and admin.
 * Returns last-activity timestamps per context so the frontend can poll once
 * and refetch only when a relevant context has changed (no browser refresh).
 */
class LiveRefreshController
{
    use BaseApiController;

    /** Context keys returned in the response; frontend subscribes by context. */
    public const CONTEXT_NOTIFICATIONS = 'notifications';
    public const CONTEXT_BOOKINGS = 'bookings';
    public const CONTEXT_CHILDREN = 'children';
    public const CONTEXT_TRAINER_SCHEDULES = 'trainer_schedules';
    /** When any trainer updates availability or absence; admin schedule calendar refetches. */
    public const CONTEXT_TRAINER_AVAILABILITY = 'trainer_availability';

    /**
     * Return context versions (last updated timestamps) for the authenticated user.
     * Scoped by role: parent sees own bookings/children, trainer sees own schedules, admin sees all.
     *
     * GET /api/v1/live-refresh
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role ?? 'parent';

        $contexts = [
            self::CONTEXT_NOTIFICATIONS => $this->notificationsVersion($user->id),
            self::CONTEXT_BOOKINGS => $this->bookingsVersion($user->id, $role),
            self::CONTEXT_CHILDREN => $this->childrenVersion($user->id, $role),
            self::CONTEXT_TRAINER_SCHEDULES => $this->trainerSchedulesVersion($user->id, $role),
            self::CONTEXT_TRAINER_AVAILABILITY => $this->trainerAvailabilityVersion($user->id, $role),
        ];

        return $this->successResponse([
            'contexts' => array_map(
                fn (?string $ts) => $ts,
                $contexts
            ),
        ]);
    }

    /**
     * Normalise DB max() result to ISO8601 string. Laravel may return a raw string or Carbon.
     */
    private function toIso8601(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }
        if (is_string($value)) {
            try {
                return Carbon::parse($value)->toIso8601String();
            } catch (\Throwable) {
                return $value;
            }
        }
        if ($value instanceof \DateTimeInterface) {
            return $value->format(\DateTimeInterface::ATOM);
        }

        return null;
    }

    private function notificationsVersion(int $userId): ?string
    {
        $max = UserNotification::where('user_id', $userId)->max('created_at');

        return $this->toIso8601($max);
    }

    private function bookingsVersion(int $userId, string $role): ?string
    {
        if (in_array($role, ['admin', 'super_admin'], true)) {
            $max = Booking::query()->max('updated_at');
        } elseif ($role === 'trainer') {
            $max = Booking::query()
                ->whereHas('schedules', fn ($q) => $q->where('trainer_id', $userId))
                ->max('updated_at');
        } else {
            $max = Booking::query()->where('user_id', $userId)->max('updated_at');
        }

        return $this->toIso8601($max);
    }

    private function childrenVersion(int $userId, string $role): ?string
    {
        if (in_array($role, ['admin', 'super_admin'], true)) {
            $max = Child::query()->max('updated_at');
        } else {
            $max = Child::query()->where('user_id', $userId)->max('updated_at');
        }

        return $this->toIso8601($max);
    }

    private function trainerSchedulesVersion(int $userId, string $role): ?string
    {
        if (in_array($role, ['admin', 'super_admin'], true)) {
            $max = BookingSchedule::query()->max('updated_at');
        } elseif ($role === 'trainer') {
            $max = BookingSchedule::query()
                ->where('trainer_id', $userId)
                ->max('updated_at');
        } else {
            return null;
        }

        return $this->toIso8601($max);
    }

    /**
     * When any trainer's availability or absence changes; admin schedule calendar uses this to refetch.
     */
    private function trainerAvailabilityVersion(int $userId, string $role): ?string
    {
        if (! in_array($role, ['admin', 'super_admin', 'trainer'], true)) {
            return null;
        }

        $availabilityMax = \Illuminate\Support\Facades\Schema::hasTable('trainer_availabilities')
            ? TrainerAvailability::query()->max('updated_at')
            : null;
        $absenceMax = TrainerAbsenceRequest::query()->max('updated_at');

        $a = $this->toIso8601($availabilityMax);
        $b = $this->toIso8601($absenceMax);
        if ($a === null) {
            return $b;
        }
        if ($b === null) {
            return $a;
        }

        return strcmp($a, $b) >= 0 ? $a : $b;
    }
}
