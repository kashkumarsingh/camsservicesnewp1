<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\BookingSchedule;
use App\Models\BookingScheduleActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * TrainerActivityController (Interface Layer)
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Handles trainer activity assignment and management API requests
 * Location: backend/app/Http/Controllers/Api/TrainerActivityController.php
 */
class TrainerActivityController extends Controller
{
    /**
     * Get session activities with calculation info
     * 
     * GET /api/v1/trainer/schedules/{scheduleId}/activities
     */
    public function getSessionActivities(Request $request, int $scheduleId): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Get trainer model linked to this user
        $trainerModel = \App\Models\Trainer::where('user_id', $user->id)->first();
        
        if (!$trainerModel) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found. Please contact admin.',
            ], 404);
        }

        // Verify schedule belongs to trainer
        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->with([
                'booking:id,reference,package_id',
                'booking.package:id,name,hours_per_activity,allow_activity_override',
                'activities:id,name,slug,description',
                'currentActivity:id,name',
                'currentActivityUpdates',
            ])
            ->first();

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found or not assigned to this trainer.',
            ], 404);
        }

        // Get assigned activities with pivot data
        $assignedActivities = $schedule->activities()
            ->withPivot('id', 'duration_hours', 'order', 'notes', 'assignment_status', 'assigned_at', 'confirmed_at')
            ->orderByPivot('order')
            ->get();

        // Get available activities (all active activities)
        $availableActivities = Activity::active()
            ->select('id', 'name', 'slug', 'description')
            ->orderBy('name')
            ->get();

        // Calculate activity count
        $calculatedCount = $schedule->calculateActivityCount();

        return response()->json([
            'success' => true,
            'data' => [
                'schedule' => [
                    'id' => $schedule->id,
                    'date' => $schedule->date->format('Y-m-d'),
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'duration_hours' => (float) $schedule->duration_hours,
                    'activity_count' => $schedule->activity_count,
                    'is_activity_override' => $schedule->is_activity_override,
                    'activity_override_reason' => $schedule->activity_override_reason,
                    'activity_status' => $schedule->activity_status,
                    'activity_confirmed_at' => $schedule->activity_confirmed_at?->toIso8601String(),
                    'calculated_activity_count' => $calculatedCount,
                    'current_activity_id' => $schedule->current_activity_id,
                    'current_activity_name' => $schedule->currentActivity?->name,
                    'location' => $schedule->location,
                    'current_activity_updates' => $schedule->currentActivityUpdates->map(fn ($u) => [
                        'id' => $u->id,
                        'activity_name' => $u->activity_name,
                        'location' => $u->location,
                        'at' => $u->created_at->format('g:i A'),
                    ])->values()->all(),
                    'package' => [
                        'id' => $schedule->booking->package->id,
                        'name' => $schedule->booking->package->name,
                        'hours_per_activity' => (float) ($schedule->booking->package->hours_per_activity ?? 3.0),
                        'allow_activity_override' => $schedule->booking->package->allow_activity_override ?? true,
                    ],
                ],
                'activities' => $assignedActivities->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'name' => $activity->name,
                        'slug' => $activity->slug,
                        'description' => $activity->description,
                        'duration_hours' => (float) $activity->pivot->duration_hours,
                        'order' => $activity->pivot->order,
                        'notes' => $activity->pivot->notes,
                        'assignment_status' => $activity->pivot->assignment_status,
                        'assigned_at' => $activity->pivot->assigned_at?->toIso8601String(),
                        'confirmed_at' => $activity->pivot->confirmed_at?->toIso8601String(),
                    ];
                }),
                'available_activities' => $availableActivities->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'name' => $activity->name,
                        'slug' => $activity->slug,
                        'description' => $activity->description,
                        'image_url' => null,
                        'difficulty_level' => null,
                    ];
                }),
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }

    /**
     * Assign activity to session
     * 
     * POST /api/v1/trainer/schedules/{scheduleId}/activities
     */
    public function assignActivity(Request $request, int $scheduleId): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Get trainer model linked to this user
        $trainerModel = \App\Models\Trainer::where('user_id', $user->id)->first();
        
        if (!$trainerModel) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found. Please contact admin.',
            ], 404);
        }

        // Verify schedule belongs to trainer
        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->with('booking.package')
            ->first();

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found or not assigned to this trainer.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'activity_id' => ['required', 'integer', 'exists:activities,id'],
            'duration_hours' => ['nullable', 'numeric', 'min:0', 'max:24'],
            'order' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if activity already assigned
        $existing = BookingScheduleActivity::where('booking_schedule_id', $scheduleId)
            ->where('activity_id', $request->activity_id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Activity already assigned to this session.',
            ], 422);
        }

        // Get activity
        $activity = Activity::findOrFail($request->activity_id);

        // Create activity assignment
        $scheduleActivity = BookingScheduleActivity::create([
            'booking_schedule_id' => $scheduleId,
            'activity_id' => $request->activity_id,
            'duration_hours' => $request->duration_hours ?? $schedule->duration_hours,
            'order' => $request->order ?? 0,
            'notes' => $request->notes,
            'assignment_status' => 'assigned',
            'assigned_by' => $user->id,
            'assigned_at' => now(),
        ]);

        // Update schedule activity status
        if ($schedule->activity_status === 'pending') {
            $schedule->activity_status = 'assigned';
            $schedule->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Activity assigned successfully.',
            'data' => [
                'schedule' => [
                    'id' => $schedule->id,
                    'activity_status' => $schedule->activity_status,
                ],
                'activity' => [
                    'id' => $activity->id,
                    'name' => $activity->name,
                    'slug' => $activity->slug,
                    'assignment_status' => $scheduleActivity->assignment_status,
                    'assigned_at' => $scheduleActivity->assigned_at->toIso8601String(),
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 201);
    }

    /**
     * Confirm activity assignment (triggers parent notification)
     * 
     * POST /api/v1/trainer/schedules/{scheduleId}/activities/confirm
     */
    public function confirmActivities(Request $request, int $scheduleId): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Get trainer model linked to this user
        $trainerModel = \App\Models\Trainer::where('user_id', $user->id)->first();
        
        if (!$trainerModel) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found. Please contact admin.',
            ], 404);
        }

        // Verify schedule belongs to trainer
        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->with([
                'booking:id,user_id,reference',
                'booking.user:id,name,email',
                'activities',
            ])
            ->first();

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found or not assigned to this trainer.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'activity_ids' => ['nullable', 'array'],
            'activity_ids.*' => ['integer', 'exists:booking_schedule_activities,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Get activities to confirm (if specific IDs provided, otherwise confirm all assigned)
        $query = BookingScheduleActivity::where('booking_schedule_id', $scheduleId)
            ->where('assignment_status', 'assigned');

        if ($request->has('activity_ids') && !empty($request->activity_ids)) {
            $query->whereIn('id', $request->activity_ids);
        }

        $activities = $query->get();

        if ($activities->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No activities found to confirm. Please assign activities first.',
            ], 422);
        }

        DB::transaction(function () use ($activities, $schedule, $request) {
            // Confirm all activities
            foreach ($activities as $activity) {
                $activity->markAsConfirmed();
            }

            // Update schedule status
            $schedule->activity_status = 'confirmed';
            $schedule->activity_confirmed_at = now();
            $schedule->save();

            // Dispatch event for parent notification
            event(new \App\Events\ActivityConfirmed($schedule, $activities));
        });

        return response()->json([
            'success' => true,
            'message' => 'Activities confirmed. Parent has been notified.',
            'data' => [
                'schedule' => [
                    'id' => $schedule->id,
                    'activity_status' => $schedule->activity_status,
                    'activity_confirmed_at' => $schedule->activity_confirmed_at->toIso8601String(),
                ],
                'activities' => $activities->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'activity_id' => $activity->activity_id,
                        'assignment_status' => $activity->assignment_status,
                        'confirmed_at' => $activity->confirmed_at->toIso8601String(),
                    ];
                }),
                'notification_sent' => true,
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }

    /**
     * Override activity count for session
     * 
     * PUT /api/v1/trainer/schedules/{scheduleId}/activities/override
     */
    public function overrideActivityCount(Request $request, int $scheduleId): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Get trainer model linked to this user
        $trainerModel = \App\Models\Trainer::where('user_id', $user->id)->first();
        
        if (!$trainerModel) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found. Please contact admin.',
            ], 404);
        }

        // Verify schedule belongs to trainer
        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->with('booking.package')
            ->first();

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found or not assigned to this trainer.',
            ], 404);
        }

        // Check if override is allowed
        $package = $schedule->booking->package;
        if (!$package->allow_activity_override) {
            return response()->json([
                'success' => false,
                'message' => 'Activity override is not allowed for this package.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'activity_count' => ['required', 'integer', 'min:1', 'max:10'],
            'override_reason' => ['required', 'string', 'min:10', 'max:500'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Override activity count
        $schedule->overrideActivityCount(
            $request->activity_count,
            $request->override_reason
        );

        return response()->json([
            'success' => true,
            'message' => 'Activity count overridden successfully.',
            'data' => [
                'schedule' => [
                    'id' => $schedule->id,
                    'activity_count' => $schedule->activity_count,
                    'is_activity_override' => $schedule->is_activity_override,
                    'activity_override_reason' => $schedule->activity_override_reason,
                    'calculated_activity_count' => $schedule->calculateActivityCount(),
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }

    /**
     * Remove activity override (reset to calculated)
     * 
     * DELETE /api/v1/trainer/schedules/{scheduleId}/activities/override
     */
    public function removeOverride(Request $request, int $scheduleId): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Get trainer model linked to this user
        $trainerModel = \App\Models\Trainer::where('user_id', $user->id)->first();
        
        if (!$trainerModel) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found. Please contact admin.',
            ], 404);
        }

        // Verify schedule belongs to trainer
        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->first();

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found or not assigned to this trainer.',
            ], 404);
        }

        // Reset to calculated
        $schedule->resetActivityCount();

        return response()->json([
            'success' => true,
            'message' => 'Activity count reset to calculated value.',
            'data' => [
                'schedule' => [
                    'id' => $schedule->id,
                    'activity_count' => $schedule->activity_count,
                    'is_activity_override' => $schedule->is_activity_override,
                    'activity_override_reason' => $schedule->activity_override_reason,
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }

    /**
     * Remove activity from session
     * 
     * DELETE /api/v1/trainer/schedules/{scheduleId}/activities/{activityId}
     */
    public function removeActivity(Request $request, int $scheduleId, int $activityId): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Get trainer model linked to this user
        $trainerModel = \App\Models\Trainer::where('user_id', $user->id)->first();
        
        if (!$trainerModel) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found. Please contact admin.',
            ], 404);
        }

        // Verify schedule belongs to trainer
        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->first();

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found or not assigned to this trainer.',
            ], 404);
        }

        // Find and delete activity assignment
        $scheduleActivity = BookingScheduleActivity::where('booking_schedule_id', $scheduleId)
            ->where('id', $activityId)
            ->first();

        if (!$scheduleActivity) {
            return response()->json([
                'success' => false,
                'message' => 'Activity assignment not found.',
            ], 404);
        }

        $scheduleActivity->delete();

        // Update schedule status if no activities left
        $remainingActivities = BookingScheduleActivity::where('booking_schedule_id', $scheduleId)->count();
        if ($remainingActivities === 0) {
            $schedule->activity_status = 'pending';
            $schedule->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Activity removed successfully.',
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }
}

