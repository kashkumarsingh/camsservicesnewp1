<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Api\ErrorCodes;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\LiveRefreshController;
use App\Models\ActivityLog;
use App\Models\Child;
use App\Services\LiveRefreshBroadcastService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

/**
 * TrainerActivityLogController (Interface Layer)
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Handles trainer activity log API requests
 * Location: backend/app/Http/Controllers/Api/TrainerActivityLogController.php
 */
class TrainerActivityLogController extends Controller
{
    use BaseApiController;
    /**
     * Get all activity logs for the authenticated trainer
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $trainer */
        $trainer = Auth::user();

        // Get trainer model linked to this user
        $trainerModel = \App\Models\Trainer::where('user_id', $trainer->id)->first();
        
        if (! $trainerModel) {
            return $this->notFoundResponse('Trainer profile');
        }

        $query = ActivityLog::where('trainer_id', $trainer->id)
            ->with([
                'child:id,name,age',
                'booking:id,reference',
                'schedule:id,date,start_time',
            ])
            ->orderBy('activity_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Filter by child
        if ($request->has('child_id')) {
            $query->where('child_id', $request->child_id);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('activity_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('activity_date', '<=', $request->date_to);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by milestone
        if ($request->has('milestone') && $request->milestone === 'true') {
            $query->where('milestone_achieved', true);
        }

        $logs = $query->paginate($request->get('per_page', 15));

        return $this->successResponse(
            ['activity_logs' => $logs->items()],
            null,
            [
                'pagination' => [
                    'currentPage' => $logs->currentPage(),
                    'perPage' => $logs->perPage(),
                    'total' => $logs->total(),
                    'lastPage' => $logs->lastPage(),
                    'from' => $logs->firstItem(),
                    'to' => $logs->lastItem(),
                ],
            ]
        );
    }

    /**
     * Get activity logs for a specific booking schedule (session).
     * GET /api/v1/trainer/schedules/{scheduleId}/activity-logs
     */
    public function indexBySchedule(int $scheduleId): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $trainerModel = \App\Models\Trainer::where('user_id', $user->id)->first();
        if (! $trainerModel) {
            return $this->notFoundResponse('Trainer profile');
        }

        $schedule = \App\Models\BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->first();

        if (! $schedule) {
            return $this->errorResponse(
                'Schedule not found or not assigned to you.',
                ErrorCodes::RESOURCE_NOT_FOUND,
                [],
                404
            );
        }

        $logs = ActivityLog::where('booking_schedule_id', $scheduleId)
            ->where('trainer_id', $user->id)
            ->with([
                'child:id,name,age',
                'booking:id,reference',
                'schedule:id,date,start_time',
            ])
            ->orderBy('activity_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse(['activity_logs' => $logs]);
    }

    /**
     * Get activity logs for a specific child
     */
    public function getChildLogs(Request $request, int $childId): JsonResponse
    {
        /** @var \App\Models\User $trainer */
        $trainer = Auth::user();

        // Verify child exists and trainer has access (through bookings)
        $child = Child::find($childId);
        if (! $child) {
            return $this->notFoundResponse('Child');
        }

        // Get trainer model
        $trainerModel = \App\Models\Trainer::where('user_id', $trainer->id)->first();

        if (! $trainerModel) {
            return $this->notFoundResponse('Trainer profile');
        }

        // Verify trainer has access to this child (through bookings)
        $hasAccess = \App\Models\BookingSchedule::where('trainer_id', $trainerModel->id)
            ->whereHas('booking.participants', function ($query) use ($childId) {
                $query->where('child_id', $childId);
            })
            ->exists();

        if (! $hasAccess) {
            return $this->forbiddenResponse('You do not have access to this child\'s activity logs.');
        }

        $query = ActivityLog::where('trainer_id', $trainer->id)
            ->where('child_id', $childId)
            ->with([
                'booking:id,reference',
                'schedule:id,date,start_time',
            ])
            ->orderBy('activity_date', 'desc')
            ->orderBy('created_at', 'desc');

        $logs = $query->paginate($request->get('per_page', 15));

        return $this->successResponse(
            [
                'child' => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'age' => $child->age,
                ],
                'activity_logs' => $logs->items(),
            ],
            null,
            [
                'pagination' => [
                    'currentPage' => $logs->currentPage(),
                    'perPage' => $logs->perPage(),
                    'total' => $logs->total(),
                    'lastPage' => $logs->lastPage(),
                    'from' => $logs->firstItem(),
                    'to' => $logs->lastItem(),
                ],
            ]
        );
    }

    /**
     * Get a specific activity log
     */
    public function show(int $id): JsonResponse
    {
        /** @var \App\Models\User $trainer */
        $trainer = Auth::user();

        $log = ActivityLog::where('id', $id)
            ->where('trainer_id', $trainer->id)
            ->with([
                'child:id,name,age',
                'booking:id,reference',
                'schedule:id,date,start_time',
                'trainer:id,name',
            ])
            ->first();

        if (! $log) {
            return $this->errorResponse(
                'Activity log not found or you do not have access.',
                ErrorCodes::RESOURCE_NOT_FOUND,
                [],
                404
            );
        }

        return $this->successResponse(['activity_log' => $log]);
    }

    /**
     * Create a new activity log
     */
    public function store(Request $request): JsonResponse
    {
        /** @var \App\Models\User $trainer */
        $trainer = Auth::user();

        $validator = Validator::make($request->all(), [
            'child_id' => ['required', 'integer', 'exists:children,id'],
            'booking_id' => ['nullable', 'integer', 'exists:bookings,id'],
            'booking_schedule_id' => ['nullable', 'integer', 'exists:booking_schedules,id'],
            'activity_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'behavioral_observations' => ['nullable', 'string', 'max:5000'],
            'achievements' => ['nullable', 'string', 'max:5000'],
            'challenges' => ['nullable', 'string', 'max:5000'],
            'status' => ['nullable', 'string', 'in:in_progress,completed,needs_attention'],
            'activity_date' => ['required', 'date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'duration_minutes' => ['nullable', 'numeric', 'min:0'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['string', 'url'],
            'videos' => ['nullable', 'array'],
            'videos.*' => ['string', 'url'],
            'consent_photography' => ['nullable', 'boolean'],
            'milestone_achieved' => ['nullable', 'boolean'],
            'milestone_name' => ['nullable', 'string', 'max:255'],
            'milestone_description' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        // Verify trainer has access to this child
        $child = Child::find($request->child_id);
        if (! $child) {
            return $this->notFoundResponse('Child');
        }

        // Get trainer model
        $trainerModel = \App\Models\Trainer::where('user_id', $trainer->id)->first();

        if (! $trainerModel) {
            return $this->notFoundResponse('Trainer profile');
        }

        // Verify access through bookings
        $hasAccess = \App\Models\BookingSchedule::where('trainer_id', $trainerModel->id)
            ->whereHas('booking.participants', function ($query) use ($request) {
                $query->where('child_id', $request->child_id);
            })
            ->exists();

        if (! $hasAccess) {
            return $this->forbiddenResponse('You do not have access to create activity logs for this child.');
        }

        // Do not allow activity logs for sessions that have not started yet
        if ($request->filled('booking_schedule_id')) {
            $schedule = \App\Models\BookingSchedule::where('id', $request->booking_schedule_id)
                ->where('trainer_id', $trainerModel->id)
                ->first();
            if ($schedule && $schedule->date && $schedule->start_time) {
                $sessionStart = \Carbon\Carbon::parse($schedule->date->format('Y-m-d') . ' ' . $schedule->start_time);
                if ($sessionStart->isFuture()) {
                    return $this->errorResponse(
                        'You cannot add activity logs until the session has started.',
                        ErrorCodes::INVALID_STATE,
                        [],
                        422
                    );
                }
            }
        }

        $log = ActivityLog::create([
            'trainer_id' => $trainer->id,
            'child_id' => $request->child_id,
            'booking_id' => $request->booking_id,
            'booking_schedule_id' => $request->booking_schedule_id,
            'activity_name' => $request->activity_name,
            'description' => $request->description,
            'notes' => $request->notes,
            'behavioral_observations' => $request->behavioral_observations,
            'achievements' => $request->achievements,
            'challenges' => $request->challenges,
            'status' => $request->status ?? ActivityLog::STATUS_IN_PROGRESS,
            'activity_date' => $request->activity_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'duration_minutes' => $request->duration_minutes,
            'photos' => $request->photos ?? [],
            'videos' => $request->videos ?? [],
            'consent_photography' => $request->consent_photography ?? false,
            'milestone_achieved' => $request->milestone_achieved ?? false,
            'milestone_name' => $request->milestone_name,
            'milestone_description' => $request->milestone_description,
        ]);

        // Live refresh: admin and parent session activity / activity logs update without manual refresh
        if ($log->booking_schedule_id) {
            $schedule = \App\Models\BookingSchedule::with('booking', 'trainer')->find($log->booking_schedule_id);
            if ($schedule) {
                $userIds = array_filter([$schedule->trainer?->user_id]);
                if ($schedule->booking?->user_id) {
                    $userIds[] = $schedule->booking->user_id;
                }
                $userIds = array_values(array_unique($userIds));
                LiveRefreshBroadcastService::notify(
                    [LiveRefreshController::CONTEXT_BOOKINGS, LiveRefreshController::CONTEXT_TRAINER_SCHEDULES],
                    $userIds,
                    true
                );
            }
        }

        return $this->successResponse(
            ['activity_log' => $log->load('child:id,name,age')],
            'Activity log created successfully',
            [],
            201
        );
    }

    /**
     * Update an activity log (only within 24 hours)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        /** @var \App\Models\User $trainer */
        $trainer = Auth::user();

        $log = ActivityLog::where('id', $id)
            ->where('trainer_id', $trainer->id)
            ->first();

        if (! $log) {
            return $this->errorResponse(
                'Activity log not found or you do not have access.',
                ErrorCodes::RESOURCE_NOT_FOUND,
                [],
                404
            );
        }

        if (! $log->canBeEdited()) {
            return $this->forbiddenResponse(
                'This activity log can no longer be edited. The 24-hour editing window has expired.'
            );
        }

        $validator = Validator::make($request->all(), [
            'activity_name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'behavioral_observations' => ['nullable', 'string', 'max:5000'],
            'achievements' => ['nullable', 'string', 'max:5000'],
            'challenges' => ['nullable', 'string', 'max:5000'],
            'status' => ['nullable', 'string', 'in:in_progress,completed,needs_attention'],
            'activity_date' => ['sometimes', 'required', 'date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'duration_minutes' => ['nullable', 'numeric', 'min:0'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['string', 'url'],
            'videos' => ['nullable', 'array'],
            'videos.*' => ['string', 'url'],
            'consent_photography' => ['nullable', 'boolean'],
            'milestone_achieved' => ['nullable', 'boolean'],
            'milestone_name' => ['nullable', 'string', 'max:255'],
            'milestone_description' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        $log->update($validator->validated());

        // Live refresh: admin and parent session activity / activity logs update without manual refresh
        if ($log->booking_schedule_id) {
            $schedule = \App\Models\BookingSchedule::with('booking', 'trainer')->find($log->booking_schedule_id);
            if ($schedule) {
                $userIds = array_filter([$schedule->trainer?->user_id]);
                if ($schedule->booking?->user_id) {
                    $userIds[] = $schedule->booking->user_id;
                }
                $userIds = array_values(array_unique($userIds));
                LiveRefreshBroadcastService::notify(
                    [LiveRefreshController::CONTEXT_BOOKINGS, LiveRefreshController::CONTEXT_TRAINER_SCHEDULES],
                    $userIds,
                    true
                );
            }
        }

        return $this->successResponse(
            ['activity_log' => $log->fresh(['child:id,name,age'])],
            'Activity log updated successfully'
        );
    }

    /**
     * Upload photo for activity log
     */
    public function uploadPhoto(Request $request, int $id): JsonResponse
    {
        /** @var \App\Models\User $trainer */
        $trainer = Auth::user();

        $log = ActivityLog::where('id', $id)
            ->where('trainer_id', $trainer->id)
            ->first();

        if (! $log) {
            return $this->errorResponse(
                'Activity log not found or you do not have access.',
                ErrorCodes::RESOURCE_NOT_FOUND,
                [],
                404
            );
        }

        $validator = Validator::make($request->all(), [
            'photo' => ['required', 'image', 'max:10240'], // 10MB max
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        // Store photo
        $path = $request->file('photo')->store('activity-logs/photos', 'public');
        $url = Storage::url($path);

        // Add to photos array
        $photos = $log->photos ?? [];
        $photos[] = $url;
        $log->update(['photos' => $photos]);

        return $this->successResponse(
            [
                'photo_url' => $url,
                'activity_log' => $log->fresh(),
            ],
            'Photo uploaded successfully'
        );
    }
}

