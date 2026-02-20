<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\BookingSchedule;
use App\Models\TimeEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Parent Schedule Detail API
 *
 * Clean Architecture: Interface Adapter (API Controller)
 * Purpose: Return read-only session detail for a single schedule (activity logs, current activity, time entries).
 * Used by the parent Session Detail modal to show the same structure as trainer session details.
 */
class ParentScheduleDetailController extends Controller
{
    use BaseApiController;

    /**
     * Show session detail for the given schedule (activity logs, current activity, clock in/out).
     * Schedule must belong to the authenticated parent's confirmed, paid booking.
     */
    public function show(Request $request, int $scheduleId): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        $schedule = BookingSchedule::query()
            ->where('id', $scheduleId)
            ->whereHas('booking', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->where('status', 'confirmed')
                    ->where('payment_status', 'paid');
            })
            ->with(['currentActivity', 'currentActivityUpdates'])
            ->first();

        if (! $schedule) {
            return $this->notFoundResponse('Schedule');
        }

        $activityLogs = ActivityLog::query()
            ->where('booking_schedule_id', $schedule->id)
            ->with(['child:id,name,age', 'schedule:id,date,start_time'])
            ->orderByDesc('activity_date')
            ->orderByDesc('created_at')
            ->get();

        $logItems = $activityLogs->map(function (ActivityLog $log) {
            $scheduleRel = $log->schedule;
            $dateStr = $log->activity_date ? \Carbon\Carbon::parse($log->activity_date)->format('Y-m-d') : null;
            return [
                'id' => $log->id,
                'trainer_id' => $log->trainer_id,
                'child_id' => $log->child_id,
                'booking_id' => $log->booking_id,
                'booking_schedule_id' => $log->booking_schedule_id,
                'activity_name' => $log->activity_name,
                'description' => $log->description,
                'notes' => $log->notes,
                'behavioral_observations' => $log->behavioral_observations,
                'achievements' => $log->achievements,
                'challenges' => $log->challenges,
                'status' => $log->status,
                'activity_date' => $dateStr,
                'start_time' => $log->start_time,
                'end_time' => $log->end_time,
                'duration_minutes' => $log->duration_minutes,
                'milestone_achieved' => (bool) $log->milestone_achieved,
                'milestone_name' => $log->milestone_name,
                'milestone_description' => $log->milestone_description,
                'created_at' => $log->created_at?->toIso8601String(),
                'updated_at' => $log->updated_at?->toIso8601String(),
                'child' => $log->child ? [
                    'id' => $log->child->id,
                    'name' => $log->child->name,
                    'age' => $log->child->age,
                ] : null,
                'schedule' => $scheduleRel ? [
                    'id' => $scheduleRel->id,
                    'date' => $scheduleRel->date instanceof \Carbon\Carbon ? $scheduleRel->date->format('Y-m-d') : (string) $scheduleRel->date,
                    'start_time' => $scheduleRel->start_time,
                ] : null,
            ];
        });

        $currentActivityUpdates = $schedule->currentActivityUpdates->map(function ($u) {
            return [
                'id' => $u->id,
                'activity_name' => $u->activity_name,
                'location' => $u->location,
                'at' => $u->created_at?->toIso8601String(),
            ];
        })->values()->all();

        $timeEntries = TimeEntry::query()
            ->where('booking_schedule_id', $schedule->id)
            ->orderBy('created_at')
            ->get()
            ->map(function (TimeEntry $e) {
                return [
                    'id' => $e->id,
                    'type' => $e->type,
                    'recorded_at' => $e->recorded_at?->toIso8601String(),
                    'created_at' => $e->created_at?->toIso8601String(),
                ];
            })
            ->values()
            ->all();

        $data = [
            'schedule' => [
                'id' => $schedule->id,
                'current_activity_id' => $schedule->current_activity_id,
                'current_activity_name' => $schedule->currentActivity?->name,
                'location' => $schedule->location,
                'current_activity_updates' => $currentActivityUpdates,
            ],
            'activity_logs' => $logItems->values()->all(),
            'time_entries' => $timeEntries,
        ];

        return $this->successResponse($data);
    }
}
