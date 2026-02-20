<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\BookingSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Admin Bookings Controller (Interface Layer - API)
 *
 * Clean Architecture: Interface Layer (API Adapter)
 * Purpose: Provides admin-only endpoints for managing all bookings
 * Guards: Protected by auth:sanctum + admin middleware (see routes/api.php)
 */
class AdminBookingsController extends Controller
{
    use BaseApiController;

    /**
     * List all bookings for the admin dashboard.
     *
     * GET /api/v1/admin/bookings
     *
     * Supported query parameters:
     * - status: filter by booking status (draft, pending, confirmed, cancelled, completed)
     * - payment_status: filter by payment status (pending, partial, paid, refunded, failed)
     * - package_id: filter by package ID
     * - trainer_id: filter by trainer ID (via sessions)
     * - needs_trainer: if 1, only bookings that have at least one scheduled session with no trainer assigned
     * - parent_id: filter by parent user ID
     * - date_from: filter bookings created from this date (YYYY-MM-DD)
     * - date_to: filter bookings created up to this date (YYYY-MM-DD)
     * - session_date_from: filter bookings that have at least one schedule on or after this date (YYYY-MM-DD)
     * - session_date_to: filter bookings that have at least one schedule on or before this date (YYYY-MM-DD)
     * - search: search by reference, parent name, or parent email
     * - sort_by: order column — created_at (default), reference, updated_at
     * - order: asc or desc (default: desc)
     * - limit: max number of records to return (default: 100, max: 200)
     * - offset: offset for pagination (default: 0)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Booking::query()
                ->with(['user', 'package', 'participants.child', 'schedules.trainer', 'schedules.timeEntries', 'schedules.currentActivity:id,name']);

            // Filter by status
            if ($status = $request->query('status')) {
                $query->where('status', $status);
            }

            // Filter by payment status
            if ($paymentStatus = $request->query('payment_status')) {
                $query->where('payment_status', $paymentStatus);
            }

            // Filter by package
            if ($packageId = $request->query('package_id')) {
                $query->where('package_id', $packageId);
            }

            // Filter by parent (user)
            if ($parentId = $request->query('parent_id')) {
                $query->where('user_id', $parentId);
            }

            // Filter by trainer (via sessions)
            if ($trainerId = $request->query('trainer_id')) {
                $query->whereHas('schedules', function ($q) use ($trainerId) {
                    $q->where('trainer_id', $trainerId);
                });
            }

            // Filter to bookings that have at least one scheduled session with no trainer assigned
            if ($request->boolean('needs_trainer')) {
                $query->whereHas('schedules', function ($q) {
                    $q->whereNull('trainer_id')
                        ->where('status', BookingSchedule::STATUS_SCHEDULED)
                        ->whereDate('date', '>=', now()->toDateString());
                });
            }

            // Filter by date range (booking created_at)
            if ($dateFrom = $request->query('date_from')) {
                $query->whereDate('created_at', '>=', $dateFrom);
            }
            if ($dateTo = $request->query('date_to')) {
                $query->whereDate('created_at', '<=', $dateTo);
            }

            // Filter by session date (schedules.date) – for "today's sessions" etc.
            if ($sessionDateFrom = $request->query('session_date_from')) {
                $query->whereHas('schedules', function ($q) use ($sessionDateFrom) {
                    $q->whereDate('date', '>=', $sessionDateFrom);
                });
            }
            if ($sessionDateTo = $request->query('session_date_to')) {
                $query->whereHas('schedules', function ($q) use ($sessionDateTo) {
                    $q->whereDate('date', '<=', $sessionDateTo);
                });
            }

            // Search by reference, parent name, or parent email
            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference', 'LIKE', "%{$search}%")
                      ->orWhere('parent_first_name', 'LIKE', "%{$search}%")
                      ->orWhere('parent_last_name', 'LIKE', "%{$search}%")
                      ->orWhere('parent_email', 'LIKE', "%{$search}%")
                      ->orWhere(DB::raw('CONCAT(parent_first_name, " ", parent_last_name)'), 'LIKE', "%{$search}%");
                });
            }

            $limit = max(1, min($request->integer('limit', 100), 200));
            $offset = max(0, $request->integer('offset', 0));

            $sortBy = $request->query('sort_by', 'created_at');
            $allowedSort = ['created_at', 'reference', 'updated_at'];
            if (! in_array($sortBy, $allowedSort, true)) {
                $sortBy = 'created_at';
            }
            $order = strtolower($request->query('order', 'desc')) === 'asc' ? 'asc' : 'desc';

            $totalCount = (clone $query)->count();

            $bookings = $query
                ->orderBy($sortBy, $order)
                ->skip($offset)
                ->take($limit)
                ->get();

            $formatted = $bookings->map(function (Booking $booking) {
                $parent = $booking->user;
                $package = $booking->package;
                $children = $booking->participants->map(function ($participant) {
                    return [
                        'id' => (string) $participant->child_id,
                        'name' => $participant->child?->name ?? 'Unknown',
                    ];
                });
                $sessions = $booking->schedules->map(function ($schedule) {
                    $entries = $schedule->timeEntries ?? collect();
                    $clockIn = $entries->where('type', \App\Models\TimeEntry::TYPE_CLOCK_IN)->sortByDesc('recorded_at')->first();
                    $clockOut = $entries->where('type', \App\Models\TimeEntry::TYPE_CLOCK_OUT)->sortByDesc('recorded_at')->first();

                    return [
                        'id' => (string) $schedule->id,
                        'date' => $schedule->date?->toDateString(),
                        'startTime' => $schedule->start_time,
                        'endTime' => $schedule->end_time,
                        'trainerId' => $schedule->trainer_id ? (string) $schedule->trainer_id : null,
                        'trainerName' => $schedule->trainer?->name ?? null,
                        'status' => $schedule->status,
                        'trainerAssignmentStatus' => $schedule->trainer_assignment_status,
                        'trainerConfirmedAt' => $schedule->trainer_confirmed_at?->toIso8601String(),
                        'location' => $schedule->location ?? null,
                        'clockedInAt' => $clockIn?->recorded_at?->toIso8601String(),
                        'clockedInLatitude' => $clockIn?->latitude !== null ? (float) $clockIn->latitude : null,
                        'clockedInLongitude' => $clockIn?->longitude !== null ? (float) $clockIn->longitude : null,
                        'clockedOutAt' => $clockOut?->recorded_at?->toIso8601String(),
                        'currentActivityId' => $schedule->current_activity_id ? (string) $schedule->current_activity_id : null,
                        'currentActivityName' => $schedule->currentActivity?->name ?? null,
                    ];
                });

                return [
                    'id' => (string) $booking->id,
                    'reference' => $booking->reference,
                    'status' => $booking->status,
                    'paymentStatus' => $booking->payment_status,
                    'parentId' => $parent ? (string) $parent->id : null,
                    'parentName' => $booking->parent_first_name . ' ' . $booking->parent_last_name,
                    'parentEmail' => $booking->parent_email,
                    'parentPhone' => $booking->parent_phone,
                    'packageId' => $package ? (string) $package->id : null,
                    'packageName' => $package?->name,
                    'totalHours' => (float) $booking->total_hours,
                    'bookedHours' => (float) $booking->booked_hours,
                    'usedHours' => (float) $booking->used_hours,
                    'remainingHours' => (float) $booking->remaining_hours,
                    'totalPrice' => (float) $booking->total_price,
                    'paidAmount' => (float) $booking->paid_amount,
                    'children' => $children,
                    'sessionCount' => $sessions->count(),
                    'sessions' => $sessions,
                    'startDate' => $booking->start_date?->toDateString(),
                    'packageExpiresAt' => $booking->package_expires_at?->toDateString(),
                    'createdAt' => $booking->created_at?->toIso8601String(),
                    'updatedAt' => $booking->updated_at?->toIso8601String(),
                ];
            });

            return $this->collectionResponse(
                $formatted,
                null,
                [
                    'limit' => $limit,
                    'offset' => $offset,
                    'total_count' => $totalCount,
                ]
            );
        } catch (\Exception $e) {
            Log::error('Error listing admin bookings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve bookings for admin dashboard.');
        }
    }

    /**
     * Get a single booking by ID with full details.
     *
     * GET /api/v1/admin/bookings/{id}
     */
    public function show(string $id): JsonResponse
    {
        try {
            $booking = Booking::with([
                'user',
                'package',
                'participants.child',
                'schedules.trainer.user:id,email,phone',
                'schedules.activities',
                'schedules.timeEntries',
                'schedules.currentActivity:id,name',
                'schedules.currentActivityUpdates',
                'payments',
            ])->findOrFail($id);

            $parent = $booking->user;
            $package = $booking->package;
            $children = $booking->participants->map(function ($participant) {
                $child = $participant->child;
                return [
                    'id' => (string) $participant->child_id,
                    'name' => $child?->name ?? 'Unknown',
                    'age' => $child?->age,
                    'gender' => $child?->gender,
                ];
            });
            $sessions = $booking->schedules->map(function ($schedule) {
                $entries = $schedule->timeEntries ?? collect();
                $clockIn = $entries->where('type', \App\Models\TimeEntry::TYPE_CLOCK_IN)->sortByDesc('recorded_at')->first();
                $clockOut = $entries->where('type', \App\Models\TimeEntry::TYPE_CLOCK_OUT)->sortByDesc('recorded_at')->first();

                return [
                    'id' => (string) $schedule->id,
                    'date' => $schedule->date?->toDateString(),
                    'startTime' => $schedule->start_time,
                    'endTime' => $schedule->end_time,
                    'durationHours' => (float) $schedule->duration_hours,
                    'actualDurationHours' => (float) ($schedule->actual_duration_hours ?? $schedule->duration_hours),
                    'trainerId' => $schedule->trainer_id ? (string) $schedule->trainer_id : null,
                    'trainerName' => $schedule->trainer?->name ?? null,
                    'trainerEmail' => $schedule->trainer?->user?->email ?? null,
                    'trainerPhone' => $schedule->trainer?->user?->phone ?? null,
                    'status' => $schedule->status,
                    'trainerAssignmentStatus' => $schedule->trainer_assignment_status,
                    'trainerConfirmedAt' => $schedule->trainer_confirmed_at?->toIso8601String(),
                    'location' => $schedule->location,
                    'clockedInAt' => $clockIn?->recorded_at?->toIso8601String(),
                    'clockedInLatitude' => $clockIn?->latitude !== null ? (float) $clockIn->latitude : null,
                    'clockedInLongitude' => $clockIn?->longitude !== null ? (float) $clockIn->longitude : null,
                    'clockedOutAt' => $clockOut?->recorded_at?->toIso8601String(),
                    'currentActivityId' => $schedule->current_activity_id ? (string) $schedule->current_activity_id : null,
                    'currentActivityName' => $schedule->currentActivity?->name,
                    'completedAt' => $schedule->completed_at?->toIso8601String(),
                    'cancelledAt' => $schedule->cancelled_at?->toIso8601String(),
                    'cancellationReason' => $schedule->cancellation_reason,
                    'currentActivityUpdates' => $schedule->currentActivityUpdates
                        ->sortBy('created_at')
                        ->values()
                        ->map(fn ($u) => [
                            'id' => $u->id,
                            'activityName' => $u->activity_name,
                            'location' => $u->location,
                            'at' => $u->created_at?->toIso8601String(),
                        ])
                        ->all(),
                ];
            });
            $payments = $booking->payments->map(function ($payment) {
                return [
                    'id' => (string) $payment->id,
                    'amount' => (float) $payment->amount,
                    'status' => $payment->status,
                    'paidAt' => $payment->paid_at?->toIso8601String(),
                ];
            });

            $data = [
                'id' => (string) $booking->id,
                'reference' => $booking->reference,
                'status' => $booking->status,
                'paymentStatus' => $booking->payment_status,
                'parentId' => $parent ? (string) $parent->id : null,
                'parentName' => $booking->parent_first_name . ' ' . $booking->parent_last_name,
                'parentEmail' => $booking->parent_email,
                'parentPhone' => $booking->parent_phone,
                'parentAddress' => $booking->parent_address,
                'parentPostcode' => $booking->parent_postcode,
                'parentCounty' => $booking->parent_county,
                'emergencyContact' => $booking->emergency_contact,
                'packageId' => $package ? (string) $package->id : null,
                'packageName' => $package?->name,
                'totalHours' => (float) $booking->total_hours,
                'bookedHours' => (float) $booking->booked_hours,
                'usedHours' => (float) $booking->used_hours,
                'remainingHours' => (float) $booking->remaining_hours,
                'totalPrice' => (float) $booking->total_price,
                'paidAmount' => (float) $booking->paid_amount,
                'discountAmount' => (float) $booking->discount_amount,
                'discountReason' => $booking->discount_reason,
                'paymentPlan' => $booking->payment_plan,
                'installmentCount' => $booking->installment_count,
                'nextPaymentDueAt' => $booking->next_payment_due_at?->toDateString(),
                'startDate' => $booking->start_date?->toDateString(),
                'packageExpiresAt' => $booking->package_expires_at?->toDateString(),
                'hoursExpiresAt' => $booking->hours_expires_at?->toDateString(),
                'adminNotes' => $booking->admin_notes,
                'notes' => $booking->notes,
                'cancellationReason' => $booking->cancellation_reason,
                'cancelledAt' => $booking->cancelled_at?->toIso8601String(),
                'children' => $children,
                'sessions' => $sessions,
                'payments' => $payments,
                'createdAt' => $booking->created_at?->toIso8601String(),
                'updatedAt' => $booking->updated_at?->toIso8601String(),
            ];

            return $this->successResponse($data);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Booking not found.');
        } catch (\Exception $e) {
            Log::error('Error retrieving admin booking', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve booking.');
        }
    }

    /**
     * Get activity logs for a session (schedule). Admin can view any session's trainer activity logs.
     *
     * GET /api/v1/admin/bookings/sessions/{sessionId}/activity-logs
     */
    public function sessionActivityLogs(string $sessionId): JsonResponse
    {
        try {
            $schedule = BookingSchedule::find($sessionId);
            if (!$schedule) {
                return $this->notFoundResponse('Session not found.');
            }

            $logs = ActivityLog::where('booking_schedule_id', $sessionId)
                ->with(['child:id,name,age', 'schedule:id,date,start_time,end_time'])
                ->orderBy('activity_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            $items = $logs->map(function (ActivityLog $log) {
                return [
                    'id' => (string) $log->id,
                    'activityName' => $log->activity_name,
                    'description' => $log->description,
                    'notes' => $log->notes,
                    'behavioralObservations' => $log->behavioral_observations,
                    'achievements' => $log->achievements,
                    'challenges' => $log->challenges,
                    'status' => $log->status,
                    'activityDate' => $log->activity_date?->toDateString(),
                    'startTime' => $log->start_time,
                    'endTime' => $log->end_time,
                    'durationMinutes' => $log->duration_minutes ? (float) $log->duration_minutes : null,
                    'actualHoursUsed' => $log->actual_hours_used ? (float) $log->actual_hours_used : null,
                    'activityCompletedAt' => $log->activity_completed_at?->toIso8601String(),
                    'milestoneAchieved' => (bool) $log->milestone_achieved,
                    'milestoneName' => $log->milestone_name,
                    'milestoneDescription' => $log->milestone_description,
                    'childName' => $log->child?->name ?? null,
                    'createdAt' => $log->created_at?->toIso8601String(),
                ];
            });

            return $this->successResponse(['activityLogs' => $items->values()->all()]);
        } catch (\Exception $e) {
            Log::error('Error fetching admin session activity logs', [
                'sessionId' => $sessionId,
                'error' => $e->getMessage(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve activity logs.');
        }
    }

    /**
     * Update booking status.
     *
     * PUT /api/v1/admin/bookings/{id}/status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        try {
            $booking = Booking::findOrFail($id);

            $validated = $request->validate([
                'status' => 'required|in:draft,pending,confirmed,cancelled,completed',
                'cancellation_reason' => 'nullable|string|max:500',
            ]);

            $oldStatus = $booking->status;
            $newStatus = $validated['status'];

            // Update status
            $booking->status = $newStatus;

            // Handle cancellation
            if ($newStatus === Booking::STATUS_CANCELLED) {
                $booking->cancelled_at = now();
                $booking->cancellation_reason = $validated['cancellation_reason'] ?? null;
                
                // Cancel all scheduled sessions
                $booking->schedules()
                    ->where('status', BookingSchedule::STATUS_SCHEDULED)
                    ->update([
                        'status' => BookingSchedule::STATUS_CANCELLED,
                        'cancelled_at' => now(),
                        'cancellation_reason' => 'Booking cancelled by admin',
                    ]);
            }

            // Handle completion
            if ($newStatus === Booking::STATUS_COMPLETED) {
                // Mark all scheduled sessions as completed
                $booking->schedules()
                    ->where('status', BookingSchedule::STATUS_SCHEDULED)
                    ->update([
                        'status' => BookingSchedule::STATUS_COMPLETED,
                        'completed_at' => now(),
                    ]);
            }

            $booking->save();

            // Reload relationships
            $booking->load(['user', 'package', 'participants.child', 'schedules.trainer']);

            $parent = $booking->user;
            $package = $booking->package;

            $data = [
                'id' => (string) $booking->id,
                'reference' => $booking->reference,
                'status' => $booking->status,
                'paymentStatus' => $booking->payment_status,
                'parentName' => $booking->parent_first_name . ' ' . $booking->parent_last_name,
                'packageName' => $package?->name,
                'cancelledAt' => $booking->cancelled_at?->toIso8601String(),
                'cancellationReason' => $booking->cancellation_reason,
                'updatedAt' => $booking->updated_at?->toIso8601String(),
            ];

            return $this->successResponse($data, 'Booking status updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Booking not found.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error updating booking status', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to update booking status.');
        }
    }

    /**
     * Assign, reassign, or unassign trainer to a booking session.
     *
     * PUT /api/v1/admin/bookings/sessions/{sessionId}/trainer
     * - trainer_id present: assign/reassign (trainer must be qualified; confirmation flow applies).
     * - trainer_id null: unassign (clear trainer; no notification).
     */
    public function assignTrainer(Request $request, string $sessionId): JsonResponse
    {
        try {
            $session = BookingSchedule::with(['booking.package.activities', 'booking.user'])->findOrFail($sessionId);

            $validated = $request->validate([
                'trainer_id' => 'nullable|integer|exists:trainers,id',
            ]);

            $newTrainerId = isset($validated['trainer_id']) ? (int) $validated['trainer_id'] : null;

            // Once the trainer has confirmed, do not allow reassign or unassign (business rule).
            if ($session->trainer_assignment_status === \App\Models\BookingSchedule::TRAINER_ASSIGNMENT_CONFIRMED) {
                return $this->validationErrorResponse([
                    'trainer_id' => [
                        'This session has been confirmed by the trainer. Reassignment and unassign are not allowed.',
                    ],
                ]);
            }

            if ($newTrainerId === null) {
                // Unassign: clear trainer and reset assignment state (e.g. drag session to Unassigned row)
                $session->trainer_id = null;
                $session->auto_assigned = false;
                $session->requires_admin_approval = false;
                $session->trainer_assignment_status = null;
                $session->trainer_confirmation_requested_at = null;
                $session->trainer_approved_at = null;
                $session->trainer_approved_by_user_id = null;
                $session->trainer_confirmed_at = null;
                $session->trainer_declined_at = null;
                $session->trainer_decline_reason = null;
                $session->save();
                $session->load(['trainer', 'booking.children']);

                $data = [
                    'id' => (string) $session->id,
                    'trainerId' => null,
                    'trainerName' => null,
                    'trainerEmail' => null,
                    'updatedAt' => $session->updated_at?->toIso8601String(),
                ];

                return $this->successResponse($data, 'Trainer unassigned successfully.');
            }

            $autoAssign = app(\App\Actions\Booking\AutoAssignTrainerAction::class);

            // Strict rule: only allow if trainer is in "available" list (qualified + calendar + no conflict).
            // No admin override: if trainer is busy or not available, assign is rejected.
            $availableList = $autoAssign->listAvailableForSession($session);
            $availableIds = array_map(fn ($t) => (int) $t['id'], $availableList);
            if (! in_array($newTrainerId, $availableIds, true)) {
                return $this->validationErrorResponse([
                    'trainer_id' => [
                        'This trainer is not available for this session (busy, absent, or outside their calendar). Choose an available trainer from the dropdown or drag to the Unassigned row.',
                    ],
                ]);
            }

            $session->trainer_id = $newTrainerId;
            $session->auto_assigned = false;
            $session->requires_admin_approval = false;
            $session->trainer_assignment_status = \App\Models\BookingSchedule::TRAINER_ASSIGNMENT_PENDING_CONFIRMATION;
            $session->trainer_confirmation_requested_at = now();
            $session->trainer_approved_at = null;
            $session->trainer_approved_by_user_id = null;
            $session->trainer_confirmed_at = null;
            $session->save();

            // Reload relationships
            $session->load(['trainer', 'booking.children']);

            $dispatcher = app(\App\Contracts\Notifications\INotificationDispatcher::class);
            $dispatcher->dispatch(\App\Services\Notifications\NotificationIntentFactory::sessionConfirmationRequestToTrainer($session));
            $dispatcher->dispatch(\App\Services\Notifications\NotificationIntentFactory::trainerAssignedToParent($session));

            $data = [
                'id' => (string) $session->id,
                'trainerId' => (string) $session->trainer_id,
                'trainerName' => $session->trainer?->name,
                'trainerEmail' => $session->trainer?->user?->email,
                'updatedAt' => $session->updated_at?->toIso8601String(),
            ];

            return $this->successResponse($data, 'Trainer assigned successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Session not found.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error assigning trainer', [
                'sessionId' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to assign trainer.');
        }
    }

    /**
     * List trainers available for a session (no conflict, in calendar, qualified).
     * GET /api/v1/admin/bookings/sessions/{sessionId}/available-trainers
     */
    public function availableTrainersForSession(string $sessionId): JsonResponse
    {
        try {
            $schedule = BookingSchedule::with(['booking.package.activities', 'booking.user'])->findOrFail($sessionId);

            $autoAssign = app(\App\Actions\Booking\AutoAssignTrainerAction::class);

            try {
                $list = $autoAssign->listAvailableForSession($schedule);
            } catch (\Throwable $e) {
                Log::warning('Available trainers check failed; falling back to qualified list', [
                    'session_id' => $sessionId,
                    'message' => $e->getMessage(),
                ]);
                $list = [];
            }

            // When no one passes strict availability/conflict, show qualified trainers so admin can still assign
            if (empty($list)) {
                try {
                    $list = $autoAssign->listQualifiedForSession($schedule);
                } catch (\Throwable $e) {
                    Log::warning('Qualified trainers check failed', ['session_id' => $sessionId, 'message' => $e->getMessage()]);
                }
            }

            $trainers = array_map(fn ($t) => [
                'id' => (string) $t['id'],
                'name' => $t['name'],
                'score' => $t['score'],
            ], $list);

            return $this->successResponse(['trainers' => $trainers], null);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Session not found.');
        }
    }

    /**
     * Debug: why are trainers not available for this session?
     * GET /api/v1/admin/bookings/sessions/{sessionId}/available-trainers-debug
     */
    public function availableTrainersForSessionDebug(string $sessionId): JsonResponse
    {
        try {
            $schedule = BookingSchedule::with(['booking.package.activities', 'booking.user'])->findOrFail($sessionId);
            $debug = app(\App\Actions\Booking\AutoAssignTrainerAction::class)->listAvailableForSessionDebug($schedule);
            return $this->successResponse($debug, null);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Session not found.');
        }
    }

    /**
     * Bulk cancel bookings.
     *
     * POST /api/v1/admin/bookings/bulk-cancel
     */
    public function bulkCancel(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'booking_ids' => 'required|array|min:1',
                'booking_ids.*' => 'exists:bookings,id',
                'cancellation_reason' => 'nullable|string|max:500',
            ]);

            $bookingIds = $validated['booking_ids'];
            $cancellationReason = $validated['cancellation_reason'] ?? 'Bulk cancelled by admin';

            $cancelled = 0;

            DB::transaction(function () use ($bookingIds, $cancellationReason, &$cancelled) {
                foreach ($bookingIds as $bookingId) {
                    $booking = Booking::find($bookingId);
                    if (!$booking) continue;

                    // Skip already cancelled bookings
                    if ($booking->status === Booking::STATUS_CANCELLED) continue;

                    // Update booking status
                    $booking->status = Booking::STATUS_CANCELLED;
                    $booking->cancelled_at = now();
                    $booking->cancellation_reason = $cancellationReason;
                    $booking->save();

                    // Cancel all scheduled sessions
                    $booking->schedules()
                        ->where('status', BookingSchedule::STATUS_SCHEDULED)
                        ->update([
                            'status' => BookingSchedule::STATUS_CANCELLED,
                            'cancelled_at' => now(),
                            'cancellation_reason' => $cancellationReason,
                        ]);

                    $cancelled++;
                }
            });

            return $this->successResponse(
                ['cancelled_count' => $cancelled],
                "{$cancelled} booking(s) cancelled successfully."
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error bulk cancelling bookings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to bulk cancel bookings.');
        }
    }

    /**
     * Bulk confirm bookings.
     *
     * POST /api/v1/admin/bookings/bulk-confirm
     */
    public function bulkConfirm(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'booking_ids' => 'required|array|min:1',
                'booking_ids.*' => 'exists:bookings,id',
            ]);

            $bookingIds = $validated['booking_ids'];

            $confirmed = 0;

            DB::transaction(function () use ($bookingIds, &$confirmed) {
                foreach ($bookingIds as $bookingId) {
                    $booking = Booking::find($bookingId);
                    if (!$booking) continue;

                    // Skip already confirmed or cancelled bookings
                    if (in_array($booking->status, [Booking::STATUS_CONFIRMED, Booking::STATUS_CANCELLED, Booking::STATUS_COMPLETED])) {
                        continue;
                    }

                    // Update booking status
                    $booking->status = Booking::STATUS_CONFIRMED;
                    $booking->save();

                    $confirmed++;
                }
            });

            return $this->successResponse(
                ['confirmed_count' => $confirmed],
                "{$confirmed} booking(s) confirmed successfully."
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error bulk confirming bookings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to bulk confirm bookings.');
        }
    }

    /**
     * Export bookings to CSV.
     *
     * GET /api/v1/admin/bookings/export
     */
    public function export(Request $request)
    {
        try {
            $query = Booking::query()
                ->with(['user', 'package', 'participants.child', 'schedules.trainer']);

            // Apply same filters as index
            if ($status = $request->query('status')) {
                $query->where('status', $status);
            }
            if ($paymentStatus = $request->query('payment_status')) {
                $query->where('payment_status', $paymentStatus);
            }
            if ($packageId = $request->query('package_id')) {
                $query->where('package_id', $packageId);
            }
            if ($parentId = $request->query('parent_id')) {
                $query->where('user_id', $parentId);
            }
            if ($trainerId = $request->query('trainer_id')) {
                $query->whereHas('schedules', function ($q) use ($trainerId) {
                    $q->where('trainer_id', $trainerId);
                });
            }
            if ($request->boolean('needs_trainer')) {
                $query->whereHas('schedules', function ($q) {
                    $q->whereNull('trainer_id')
                        ->where('status', BookingSchedule::STATUS_SCHEDULED)
                        ->whereDate('date', '>=', now()->toDateString());
                });
            }
            if ($dateFrom = $request->query('date_from')) {
                $query->whereDate('created_at', '>=', $dateFrom);
            }
            if ($dateTo = $request->query('date_to')) {
                $query->whereDate('created_at', '<=', $dateTo);
            }
            if ($sessionDateFrom = $request->query('session_date_from')) {
                $query->whereHas('schedules', function ($q) use ($sessionDateFrom) {
                    $q->whereDate('date', '>=', $sessionDateFrom);
                });
            }
            if ($sessionDateTo = $request->query('session_date_to')) {
                $query->whereHas('schedules', function ($q) use ($sessionDateTo) {
                    $q->whereDate('date', '<=', $sessionDateTo);
                });
            }
            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference', 'LIKE', "%{$search}%")
                      ->orWhere('parent_first_name', 'LIKE', "%{$search}%")
                      ->orWhere('parent_last_name', 'LIKE', "%{$search}%")
                      ->orWhere('parent_email', 'LIKE', "%{$search}%")
                      ->orWhere(DB::raw('CONCAT(parent_first_name, " ", parent_last_name)'), 'LIKE', "%{$search}%");
                });
            }

            $bookings = $query->orderByDesc('created_at')->get();

            // Build CSV content
            $csvData = [];
            $csvData[] = [
                'Reference',
                'Status',
                'Payment Status',
                'Parent Name',
                'Parent Email',
                'Parent Phone',
                'Package',
                'Total Hours',
                'Booked Hours',
                'Used Hours',
                'Remaining Hours',
                'Total Price',
                'Paid Amount',
                'Outstanding',
                'Session Count',
                'Trainers',
                'Start Date',
                'Created At',
            ];

            foreach ($bookings as $booking) {
                $parent = $booking->user;
                $package = $booking->package;
                
                $trainerNames = $booking->schedules
                    ->pluck('trainer.name')
                    ->filter()
                    ->unique()
                    ->join(', ');

                $csvData[] = [
                    $booking->reference,
                    $booking->status,
                    $booking->payment_status,
                    $booking->parent_first_name . ' ' . $booking->parent_last_name,
                    $booking->parent_email,
                    $booking->parent_phone,
                    $package?->name ?? 'N/A',
                    $booking->total_hours,
                    $booking->booked_hours,
                    $booking->used_hours,
                    $booking->remaining_hours,
                    $booking->total_price,
                    $booking->paid_amount,
                    $booking->total_price - $booking->paid_amount,
                    $booking->schedules->count(),
                    $trainerNames ?: 'Unassigned',
                    $booking->start_date?->toDateString() ?? 'N/A',
                    $booking->created_at?->toIso8601String() ?? 'N/A',
                ];
            }

            // Generate CSV
            $filename = 'bookings-export-' . now()->format('Y-m-d') . '.csv';
            $handle = fopen('php://temp', 'r+');
            
            foreach ($csvData as $row) {
                fputcsv($handle, $row);
            }
            
            rewind($handle);
            $csv = stream_get_contents($handle);
            fclose($handle);

            return response($csv, 200)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");

        } catch (\Exception $e) {
            Log::error('Error exporting bookings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to export bookings.');
        }
    }

    /**
     * Update booking notes.
     *
     * PUT /api/v1/admin/bookings/{id}/notes
     */
    public function updateNotes(Request $request, string $id): JsonResponse
    {
        try {
            $booking = Booking::findOrFail($id);

            $validated = $request->validate([
                'admin_notes' => 'nullable|string|max:2000',
                'notes' => 'nullable|string|max:2000',
            ]);

            if (isset($validated['admin_notes'])) {
                $booking->admin_notes = $validated['admin_notes'];
            }
            if (isset($validated['notes'])) {
                $booking->notes = $validated['notes'];
            }

            $booking->save();

            $data = [
                'id' => (string) $booking->id,
                'adminNotes' => $booking->admin_notes,
                'notes' => $booking->notes,
                'updatedAt' => $booking->updated_at?->toIso8601String(),
            ];

            return $this->successResponse($data, 'Booking notes updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Booking not found.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error updating booking notes', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to update booking notes.');
        }
    }
}
