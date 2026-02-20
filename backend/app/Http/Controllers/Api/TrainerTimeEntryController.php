<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Api\LiveRefreshController;
use App\Http\Controllers\Controller;
use App\Models\BookingSchedule;
use App\Models\TimeEntry;
use App\Services\LiveRefreshBroadcastService;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * TrainerTimeEntryController
 *
 * Clean Architecture: Interface Layer
 * Purpose: Handles trainer time tracking (clock-in / clock-out + history).
 */
class TrainerTimeEntryController extends Controller
{
    use BaseApiController;
    /**
     * Get time entries for the authenticated trainer.
     *
     * Optional filters:
     * - date_from / date_to (YYYY-MM-DD)
     * - booking_schedule_id
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $trainer = \App\Models\Trainer::where('user_id', $user->id)->first();
        if (! $trainer) {
            return $this->notFoundResponse('Trainer profile');
        }

        $query = TimeEntry::where('trainer_id', $trainer->id)
            ->with([
                'schedule.booking:id,reference,package_id',
                'schedule.booking.package:id,name,slug',
            ])
            ->orderBy('recorded_at', 'desc');

        if ($request->filled('date_from')) {
            $query->whereDate('recorded_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('recorded_at', '<=', $request->date_to);
        }

        if ($request->filled('booking_schedule_id')) {
            $query->where('booking_schedule_id', $request->booking_schedule_id);
        }

        $perPage = min((int) $request->get('per_page', 50), 100);
        $entries = $query->paginate($perPage);

        return $this->successResponse(
            ['time_entries' => $entries->items()],
            null,
            [
                'pagination' => [
                    'current_page' => $entries->currentPage(),
                    'per_page' => $entries->perPage(),
                    'total' => $entries->total(),
                    'last_page' => $entries->lastPage(),
                    'from' => $entries->firstItem(),
                    'to' => $entries->lastItem(),
                ],
            ]
        );
    }

    /**
     * Clock in for a specific schedule.
     */
    public function clockIn(Request $request, int $scheduleId): JsonResponse
    {
        return $this->recordTimeEntry($request, $scheduleId, TimeEntry::TYPE_CLOCK_IN);
    }

    /**
     * Clock out for a specific schedule.
     */
    public function clockOut(Request $request, int $scheduleId): JsonResponse
    {
        return $this->recordTimeEntry($request, $scheduleId, TimeEntry::TYPE_CLOCK_OUT);
    }

    /**
     * Shared handler for clock-in / clock-out.
     */
    protected function recordTimeEntry(Request $request, int $scheduleId, string $type): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $trainer = \App\Models\Trainer::where('user_id', $user->id)->first();
        if (! $trainer) {
            return $this->notFoundResponse('Trainer profile');
        }

        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainer->id)
            ->first();

        if (! $schedule) {
            return $this->notFoundResponse('Schedule');
        }

        $validator = Validator::make($request->all(), [
            'recorded_at' => ['nullable', 'date'],
            'source' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        $data = $validator->validated();

        $recordedAt = $data['recorded_at'] ?? now();

        $timeEntry = TimeEntry::create([
            'trainer_id' => $trainer->id,
            'booking_schedule_id' => $schedule->id,
            'type' => $type,
            'recorded_at' => $recordedAt,
            'source' => $data['source'] ?? 'trainer_app',
            'notes' => $data['notes'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
        ]);

        // Live refresh: admin and parent see clock-in/out and current activity without manual refresh
        $userIds = array_filter([$trainer->user_id]);
        $schedule->loadMissing('booking');
        if ($schedule->booking?->user_id) {
            $userIds[] = $schedule->booking->user_id;
        }
        $userIds = array_values(array_unique($userIds));
        LiveRefreshBroadcastService::notify(
            [LiveRefreshController::CONTEXT_BOOKINGS, LiveRefreshController::CONTEXT_TRAINER_SCHEDULES],
            $userIds,
            true
        );

        if ($type === TimeEntry::TYPE_CLOCK_IN) {
            $fresh = $schedule->fresh();
            app(INotificationDispatcher::class)->dispatch(
                NotificationIntentFactory::parentSessionStarted($fresh)
            );
            app(INotificationDispatcher::class)->dispatch(
                NotificationIntentFactory::adminSessionStarted($fresh)
            );
        }

        $message = $type === TimeEntry::TYPE_CLOCK_IN ? 'Clocked in successfully.' : 'Clocked out successfully.';

        return $this->successResponse(['time_entry' => $timeEntry], $message, [], 201);
    }
}

