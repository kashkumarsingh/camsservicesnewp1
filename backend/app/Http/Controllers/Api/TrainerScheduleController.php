<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Api\ErrorCodes;
use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\BookingSchedule;
use App\Models\ScheduleAttendance;
use App\Models\TrainerNote;
use App\Http\Controllers\Api\LiveRefreshController;
use App\Services\Booking\PersistCustomActivitiesFromNotesService;
use App\Services\LiveRefreshBroadcastService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * TrainerScheduleController (Interface Layer)
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Handles trainer schedule management API requests
 * Location: backend/app/Http/Controllers/Api/TrainerScheduleController.php
 */
class TrainerScheduleController extends Controller
{
    use BaseApiController;
    /**
     * Get all schedules assigned to the authenticated trainer
     * 
     * Supports calendar view with date filtering
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

        $query = BookingSchedule::where('trainer_id', $trainerModel->id)
            ->with([
                'booking:id,reference,package_id,status',
                'booking.package:id,name,slug',
                'activities:id,name,slug',
                'attendance.participant:id,first_name,last_name',
            ])
            ->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc');

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by month (for calendar view)
        if ($request->has('month')) {
            $query->whereMonth('date', $request->month);
        }
        if ($request->has('year')) {
            $query->whereYear('date', $request->year);
        }

        $schedules = $query->paginate($request->get('per_page', 50));

        return $this->successResponse(
            ['schedules' => $schedules->items()],
            null,
            [
                'pagination' => [
                    'currentPage' => $schedules->currentPage(),
                    'perPage' => $schedules->perPage(),
                    'total' => $schedules->total(),
                    'lastPage' => $schedules->lastPage(),
                    'from' => $schedules->firstItem(),
                    'to' => $schedules->lastItem(),
                ],
            ]
        );
    }

    /**
     * Get a single schedule by ID (for trainer confirmation panel and detail views).
     * GET /api/v1/trainer/schedules/{scheduleId}
     */
    public function show(int $scheduleId): JsonResponse
    {
        /** @var \App\Models\User $trainer */
        $trainer = Auth::user();

        $trainerModel = \App\Models\Trainer::where('user_id', $trainer->id)->first();
        if (! $trainerModel) {
            return $this->notFoundResponse('Trainer profile');
        }

        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->with([
                'booking:id,reference,package_id,user_id',
                'booking.package:id,name,slug',
                'booking.participants:id,booking_id,child_id,first_name,last_name',
                'booking.participants.child:id,name',
                'activities:id,name,slug',
                'attendance.participant:id,first_name,last_name',
            ])
            ->first();

        if (! $schedule) {
            return $this->errorResponse(
                'Schedule not found or not assigned to you.',
                ErrorCodes::RESOURCE_NOT_FOUND,
                [],
                404
            );
        }

        return $this->successResponse(['schedule' => $schedule]);
    }

    /**
     * Mark attendance for participants in a schedule
     */
    public function markAttendance(Request $request, int $scheduleId): JsonResponse
    {
        /** @var \App\Models\User $trainer */
        $trainer = Auth::user();

        // Get trainer model linked to this user
        $trainerModel = \App\Models\Trainer::where('user_id', $trainer->id)->first();
        
        if (! $trainerModel) {
            return $this->notFoundResponse('Trainer profile');
        }

        // Verify schedule belongs to trainer
        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->first();

        if (! $schedule) {
            return $this->errorResponse(
                'Schedule not found or not assigned to this trainer.',
                ErrorCodes::RESOURCE_NOT_FOUND,
                [],
                404
            );
        }

        $validator = Validator::make($request->all(), [
            'participants' => ['required', 'array'],
            'participants.*.participant_id' => ['required', 'integer', 'exists:booking_participants,id'],
            'participants.*.attended' => ['required', 'boolean'],
            'participants.*.arrival_time' => ['nullable', 'date_format:H:i'],
            'participants.*.departure_time' => ['nullable', 'date_format:H:i'],
            'participants.*.notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        // Get booking participants for this booking
        $participantIds = collect($request->participants)->pluck('participant_id')->toArray();
        $validParticipants = $schedule->booking->participants()
            ->whereIn('id', $participantIds)
            ->pluck('id')
            ->toArray();

        if (count($validParticipants) !== count($participantIds)) {
            return $this->errorResponse(
                'One or more participants do not belong to this booking.',
                ErrorCodes::VALIDATION_ERROR,
                [],
                422
            );
        }

        // Create or update attendance records
        $attendanceRecords = [];
        foreach ($request->participants as $participantData) {
            $attendance = ScheduleAttendance::updateOrCreate(
                [
                    'booking_schedule_id' => $scheduleId,
                    'booking_participant_id' => $participantData['participant_id'],
                ],
                [
                    'attended' => $participantData['attended'],
                    'arrival_time' => $participantData['arrival_time'] ?? null,
                    'departure_time' => $participantData['departure_time'] ?? null,
                    'notes' => $participantData['notes'] ?? null,
                    'marked_by' => $trainerModel->id,
                    'marked_at' => now(),
                ]
            );

            $attendanceRecords[] = $attendance->load('participant:id,first_name,last_name');
        }

        return $this->successResponse(
            ['attendance' => $attendanceRecords],
            'Attendance marked successfully'
        );
    }

    /**
     * Get or create notes for a schedule
     */
    public function getNotes(Request $request, int $scheduleId): JsonResponse
    {
        /** @var \App\Models\User $trainer */
        $trainer = Auth::user();

        // Get trainer model linked to this user
        $trainerModel = \App\Models\Trainer::where('user_id', $trainer->id)->first();
        
        if (! $trainerModel) {
            return $this->notFoundResponse('Trainer profile');
        }

        // Verify schedule belongs to trainer
        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->first();

        if (! $schedule) {
            return $this->errorResponse(
                'Schedule not found or not assigned to this trainer.',
                ErrorCodes::RESOURCE_NOT_FOUND,
                [],
                404
            );
        }

        $notes = TrainerNote::where('trainer_id', $trainer->id)
            ->where('booking_id', $schedule->booking_id)
            ->where('booking_schedule_id', $scheduleId)
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse(['notes' => $notes]);
    }

    /**
     * Create a note for a schedule
     */
    public function createNote(Request $request, int $scheduleId): JsonResponse
    {
        /** @var \App\Models\User $trainer */
        $trainer = Auth::user();

        // Get trainer model linked to this user
        $trainerModel = \App\Models\Trainer::where('user_id', $trainer->id)->first();
        
        if (! $trainerModel) {
            return $this->notFoundResponse('Trainer profile');
        }

        // Verify schedule belongs to trainer
        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->first();

        if (! $schedule) {
            return $this->errorResponse(
                'Schedule not found or not assigned to this trainer.',
                ErrorCodes::RESOURCE_NOT_FOUND,
                [],
                404
            );
        }

        // Notes can only be added for sessions that have ended
        $endTime = $schedule->end_time ? \Carbon\Carbon::parse($schedule->end_time)->format('H:i') : '23:59';
        $sessionEndsAt = \Carbon\Carbon::parse($schedule->date.' '.$endTime);
        if ($sessionEndsAt->isFuture()) {
            return $this->errorResponse(
                'Notes can only be added for sessions that have ended.',
                ErrorCodes::INVALID_STATE,
                [],
                422
            );
        }

        $validator = Validator::make($request->all(), [
            'note' => ['required', 'string', 'max:5000'],
            'type' => ['nullable', 'string', 'in:general,incident,feedback,attendance'],
            'is_private' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        $note = TrainerNote::create([
            'trainer_id' => $trainer->id,
            'booking_id' => $schedule->booking_id,
            'booking_schedule_id' => $scheduleId,
            'note' => $request->note,
            'type' => $request->type ?? TrainerNote::TYPE_GENERAL,
            'is_private' => $request->is_private ?? false,
        ]);

        return $this->successResponse(
            ['note' => $note],
            'Note created successfully',
            [],
            201
        );
    }

    /**
     * Update "current activity" and/or location for a schedule (trainer live status).
     * Used so admin/parent can see "Currently doing [e.g. Horse riding] at [location]".
     * Accepts either current_activity_id (from list) or current_activity_custom_name (trainer types their own);
     * custom names are persisted to the activities table (category=custom) same as parent booking.
     */
    public function updateCurrentActivity(Request $request, int $scheduleId): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $trainerModel = \App\Models\Trainer::where('user_id', $user->id)->first();

        if (! $trainerModel) {
            return $this->notFoundResponse('Trainer profile');
        }

        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainerModel->id)
            ->first();

        if (! $schedule) {
            return $this->errorResponse(
                'Schedule not found or not assigned to this trainer.',
                ErrorCodes::RESOURCE_NOT_FOUND,
                [],
                404
            );
        }

        $validator = Validator::make($request->all(), [
            'current_activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'current_activity_custom_name' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        $customName = $request->filled('current_activity_custom_name')
            ? trim($request->current_activity_custom_name)
            : null;

        if ($customName !== null && $customName !== '') {
            $persist = app(PersistCustomActivitiesFromNotesService::class);
            $persist->persistFromNotes('Custom Activity: ' . $customName);
            $activity = Activity::where('category', 'custom')->where('name', $customName)->first();
            $schedule->current_activity_id = $activity ? $activity->id : null;
        } elseif ($request->has('current_activity_id')) {
            $schedule->current_activity_id = $request->current_activity_id ?: null;
        }

        if ($request->has('location')) {
            $schedule->location = $request->location ?: null;
        }
        $schedule->save();

        $schedule->load('currentActivity:id,name');

        // Save to history so Right now tab can show past "Currently doing X at Y"
        $activityName = $schedule->currentActivity?->name ?? $customName ?? '—';
        $schedule->currentActivityUpdates()->create([
            'activity_name' => $activityName,
            'location' => $schedule->location,
        ]);

        // Live refresh: admin and parent see "currently doing X at Y" without manual refresh
        $schedule->loadMissing('booking');
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

        return $this->successResponse(
            [
                'schedule' => [
                    'id' => $schedule->id,
                    'current_activity_id' => $schedule->current_activity_id,
                    'current_activity_name' => $schedule->currentActivity?->name,
                    'location' => $schedule->location,
                ],
            ],
            'Current activity updated.'
        );
    }

    /**
     * Confirm an auto-assigned session (trainer accepts).
     */
    public function confirmAssignment(int $scheduleId): JsonResponse
    {
        $trainerModel = \App\Models\Trainer::where('user_id', Auth::id())->first();
        if (! $trainerModel) {
            return $this->notFoundResponse('Trainer profile');
        }

        $schedule = BookingSchedule::where('id', $scheduleId)
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

        if (($schedule->trainer_assignment_status ?? '') !== BookingSchedule::TRAINER_ASSIGNMENT_PENDING_CONFIRMATION) {
            return $this->errorResponse(
                'This session is not pending your confirmation.',
                ErrorCodes::INVALID_STATE,
                [],
                422
            );
        }

        $schedule->update([
            'trainer_assignment_status' => BookingSchedule::TRAINER_ASSIGNMENT_CONFIRMED,
            'trainer_confirmed_at' => now(),
            'trainer_approved_at' => now(),
            'trainer_approved_by_user_id' => $trainerModel->user_id,
            'requires_admin_approval' => false,
        ]);

        $dispatcher = app(\App\Contracts\Notifications\INotificationDispatcher::class);
        $dispatcher->dispatch(\App\Services\Notifications\NotificationIntentFactory::sessionBookedToTrainer($schedule->fresh()));
        $dispatcher->dispatch(\App\Services\Notifications\NotificationIntentFactory::trainerAssignedToParent($schedule->fresh()));

        return $this->successResponse(
            ['scheduleId' => (string) $schedule->id],
            'Session confirmed.'
        );
    }

    /**
     * Decline an auto-assigned session (system may try next trainer).
     */
    public function declineAssignment(Request $request, int $scheduleId): JsonResponse
    {
        $trainerModel = \App\Models\Trainer::where('user_id', Auth::id())->first();
        if (! $trainerModel) {
            return $this->notFoundResponse('Trainer profile');
        }

        $schedule = BookingSchedule::where('id', $scheduleId)
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

        if (($schedule->trainer_assignment_status ?? '') !== BookingSchedule::TRAINER_ASSIGNMENT_PENDING_CONFIRMATION) {
            return $this->errorResponse(
                'This session is not pending your confirmation.',
                ErrorCodes::INVALID_STATE,
                [],
                422
            );
        }

        $reason = $request->input('reason', '');

        app(\App\Actions\Booking\ProcessTrainerDeclineAndTryNextAction::class)->execute($schedule, $reason);

        return $this->successResponse(
            ['scheduleId' => (string) $schedule->id],
            'Session declined. Another trainer may be assigned.'
        );
    }
}

