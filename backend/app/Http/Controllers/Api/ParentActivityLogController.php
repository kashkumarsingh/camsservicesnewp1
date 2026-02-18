<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Parent Activity Logs API
 *
 * Clean Architecture: Interface Adapter (API Controller)
 * Purpose: Return activity logs for the authenticated parent's children (from their bookings).
 * Location: backend/app/Http/Controllers/Api/ParentActivityLogController.php
 *
 * Used by the parent Progress page to show an aggregated timeline with session notes and activity logs.
 */
class ParentActivityLogController extends Controller
{
    private const MAX_ITEMS = 100;

    /**
     * List activity logs for the authenticated parent's children.
     * Only logs for schedules that belong to the parent's confirmed, paid bookings.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $logs = ActivityLog::query()
            ->whereHas('schedule.booking', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->where('status', 'confirmed')
                    ->where('payment_status', 'paid');
            })
            ->with([
                'child:id,name,age',
                'schedule:id,date,start_time',
            ])
            ->orderByDesc('activity_date')
            ->orderByDesc('created_at')
            ->limit(self::MAX_ITEMS)
            ->get();

        $items = $logs->map(function (ActivityLog $log) {
            $schedule = $log->schedule;
            $dateStr = $schedule && $log->activity_date
                ? (\Carbon\Carbon::parse($log->activity_date))->format('Y-m-d')
                : null;
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
                'activity_date' => $dateStr ?? ($log->activity_date ? \Carbon\Carbon::parse($log->activity_date)->format('Y-m-d') : null),
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
                'schedule' => $schedule ? [
                    'id' => $schedule->id,
                    'date' => $schedule->date instanceof \Carbon\Carbon ? $schedule->date->format('Y-m-d') : (string) $schedule->date,
                    'start_time' => $schedule->start_time,
                ] : null,
            ];
        });

        return response()->json([
            'activity_logs' => $items->values()->all(),
        ]);
    }
}
