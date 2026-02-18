<?php

namespace App\Http\Controllers\Api;

use App\Actions\Booking\ParentCancelBookingScheduleAction;
use App\Actions\Booking\CreateBookingScheduleAction;
use App\Actions\Booking\DeleteBookingScheduleAction;
use App\Actions\Booking\UpdateBookingScheduleAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingScheduleRequest;
use App\Http\Requests\UpdateBookingScheduleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Booking Schedule Controller (Interface Layer - API)
 * 
 * Clean Architecture: Interface Layer (API Adapter)
 * Purpose: Handles HTTP requests for booking schedules API endpoints
 * Location: backend/app/Http/Controllers/Api/BookingScheduleController.php
 * 
 * This controller:
 * - Receives HTTP requests
 * - Calls Use Cases (Actions) from Application Layer
 * - Formats API responses (JSON) with camelCase keys for frontend compatibility
 * - Handles HTTP-specific concerns (status codes, headers)
 */
class BookingScheduleController extends Controller
{
    use BaseApiController;

    public function __construct(
        private CreateBookingScheduleAction $createScheduleAction,
        private UpdateBookingScheduleAction $updateScheduleAction,
        private DeleteBookingScheduleAction $deleteScheduleAction,
        private ParentCancelBookingScheduleAction $cancelScheduleAction,
    ) {
    }

    /**
     * Format booking schedule for API response (camelCase for frontend).
     *
     * @param \App\Models\BookingSchedule $schedule
     * @return array
     */
    private function formatScheduleResponse(\App\Models\BookingSchedule $schedule): array
    {
        $activities = $schedule->activities->map(function ($activity) {
            return [
                'id' => (string) $activity->id,
                'name' => $activity->name,
                'slug' => $activity->slug,
                'durationHours' => (float) $activity->pivot->duration_hours,
                'order' => $activity->pivot->order,
                'notes' => $activity->pivot->notes,
            ];
        })->values()->toArray();

        return [
            'id' => (string) $schedule->id,
            'bookingId' => (string) $schedule->booking_id,
            'date' => $schedule->date->format('Y-m-d'),
            'startTime' => $schedule->start_time,
            'endTime' => $schedule->end_time,
            'durationHours' => (float) $schedule->duration_hours,
            'actualDurationHours' => $schedule->actual_duration_hours ? (float) $schedule->actual_duration_hours : null,
            'trainerId' => $schedule->trainer_id ? (string) $schedule->trainer_id : null,
            'autoAssigned' => (bool) ($schedule->auto_assigned ?? false),
            'requiresAdminApproval' => (bool) ($schedule->requires_admin_approval ?? false),
            'trainerAssignmentStatus' => $schedule->trainer_assignment_status,
            'trainerConfirmationRequestedAt' => $schedule->trainer_confirmation_requested_at?->toIso8601String(),
            'trainerConfirmedAt' => $schedule->trainer_confirmed_at?->toIso8601String(),
            'trainerApprovedAt' => $schedule->trainer_approved_at?->toIso8601String(),
            'trainerApprovedByUserId' => $schedule->trainer_approved_by_user_id ? (string) $schedule->trainer_approved_by_user_id : null,
            'trainer' => $schedule->trainer ? [
                'id' => (string) $schedule->trainer->id,
                'name' => $schedule->trainer->name,
                'slug' => $schedule->trainer->slug,
                'avatarUrl' => $schedule->trainer->image,
            ] : null,
            'status' => $schedule->status,
            'modeKey' => $schedule->mode_key,
            'itineraryNotes' => $schedule->itinerary_notes,
            'location' => $schedule->location ?? null,
            'originalDate' => $schedule->original_date?->format('Y-m-d'),
            'originalStartTime' => $schedule->original_start_time,
            'actualStartTime' => $schedule->actual_start_time,
            'actualEndTime' => $schedule->actual_end_time,
            'rescheduledAt' => $schedule->rescheduled_at?->toIso8601String(),
            'rescheduleReason' => $schedule->reschedule_reason,
            'cancellationReason' => $schedule->cancellation_reason,
            'completedAt' => $schedule->completed_at?->toIso8601String(),
            'cancelledAt' => $schedule->cancelled_at?->toIso8601String(),
            'order' => $schedule->order,
            'activities' => $activities,
            'bookedBy' => $schedule->booked_by ?? 'parent', // Track who booked this session
            'bookedByUserId' => $schedule->booked_by_user_id ? (string) $schedule->booked_by_user_id : null,
            'createdAt' => $schedule->created_at->toIso8601String(),
            'updatedAt' => $schedule->updated_at->toIso8601String(),
        ];
    }

    /**
     * Create a new booking schedule.
     *
     * POST /api/v1/bookings/{bookingId}/schedules
     *
     * Supports both parent and trainer booking:
     * - Parents can book sessions for their own bookings
     * - Trainers can book sessions for bookings they're assigned to
     *
     * @param int $bookingId
     * @param StoreBookingScheduleRequest $request
     * @return JsonResponse
     */
    public function store(int $bookingId, StoreBookingScheduleRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->errorResponse(
                    'Authentication required',
                    \App\Http\Controllers\Api\ErrorCodes::AUTH_ERROR,
                    [],
                    401
                );
            }

            // Load booking to check authorization
            $booking = \App\Models\Booking::find($bookingId);
            if (!$booking) {
                return $this->notFoundResponse('Booking');
            }

            // Check if booking is confirmed and paid (required for session booking)
            if ($booking->status !== \App\ValueObjects\Booking\BookingStatus::CONFIRMED) {
                return $this->errorResponse(
                    'Booking must be confirmed before adding sessions',
                    \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                    [],
                    400
                );
            }

            // Determine if user is trainer or parent
            $isTrainer = $user->role === 'trainer';
            $trainer = null;
            $trainerId = null;

            if ($isTrainer) {
                // Trainer booking: verify trainer is assigned to this booking
                $trainer = \App\Models\Trainer::where('user_id', $user->id)->first();
                if (!$trainer) {
                    return $this->errorResponse(
                        'Trainer profile not found',
                        \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                        [],
                        404
                    );
                }

                // Authorization: Trainer can book if:
                // 1. Booking has no sessions yet (first session - anyone can book)
                // 2. Trainer has existing sessions for this booking (already assigned)
                $hasExistingSessions = $booking->schedules()->exists();
                $hasAccess = !$hasExistingSessions || // No sessions yet - can book first
                    $booking->schedules()->where('trainer_id', $trainer->id)->exists(); // Has existing sessions for this trainer

                if (!$hasAccess) {
                    return $this->errorResponse(
                        'You are not assigned to this booking. Only trainers with existing sessions can book additional sessions.',
                        \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                        [],
                        403
                    );
                }

                $trainerId = $trainer->id;
            } else {
                // Parent booking: verify they own the booking
                if ($booking->user_id !== $user->id) {
                    return $this->errorResponse(
                        'You do not have access to this booking',
                        \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                        [],
                        403
                    );
                }
            }

            // Prepare schedule data
            $data = $request->validated();
            $data['booking_id'] = $bookingId;
            $data['booked_by'] = $isTrainer ? 'trainer' : 'parent';
            $data['booked_by_user_id'] = $user->id;

            // If trainer is booking, set trainer_id automatically
            if ($isTrainer && $trainerId) {
                $data['trainer_id'] = $trainerId;
            }

            $schedule = $this->createScheduleAction->execute($data);

            return $this->successResponse(
                $this->formatScheduleResponse($schedule),
                'Session booked successfully.',
                [],
                201
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Booking');
        } catch (\Illuminate\Validation\ValidationException $e) {
            $messages = $e->errors();
            $firstMessage = collect($messages)->flatten()->first();
            return $this->errorResponse(
                is_string($firstMessage) ? $firstMessage : 'Validation failed.',
                \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                [],
                422
            );
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR, [], 400);
        } catch (\Exception $e) {
            Log::error('Error creating booking schedule', [
                'booking_id' => $bookingId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return $this->serverErrorResponse('Failed to create booking schedule.');
        }
    }

    /**
     * Update a booking schedule.
     *
     * PUT /api/v1/bookings/schedules/{id}
     *
     * @param int $id
     * @param UpdateBookingScheduleRequest $request
     * @return JsonResponse
     */
    public function update(int $id, UpdateBookingScheduleRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $schedule = $this->updateScheduleAction->execute($id, $data);

            return $this->successResponse(
                $this->formatScheduleResponse($schedule),
                'Booking schedule updated successfully.'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Booking schedule');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR, [], 400);
        } catch (\Exception $e) {
            Log::error('Error updating booking schedule', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);
            
            return $this->serverErrorResponse('Failed to update booking schedule.');
        }
    }

    /**
     * Delete a booking schedule.
     *
     * DELETE /api/v1/bookings/schedules/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->deleteScheduleAction->execute($id);

            if (!$deleted) {
                return $this->notFoundResponse('Booking schedule');
            }

            return $this->successResponse(null, 'Booking schedule deleted successfully.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR, [], 400);
        } catch (\Exception $e) {
            Log::error('Error deleting booking schedule', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);
            
            return $this->serverErrorResponse('Failed to delete booking schedule.');
        }
    }

    /**
     * Cancel a booking schedule (session) for a parent.
     *
     * POST /api/v1/bookings/schedules/{id}/cancel
     */
    public function cancel(int $id, \Illuminate\Http\Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->errorResponse(
                    'Authentication required',
                    \App\Http\Controllers\Api\ErrorCodes::AUTH_ERROR,
                    [],
                    401
                );
            }

            // Load schedule with booking for authorisation checks
            $schedule = \App\Models\BookingSchedule::with('booking')->find($id);
            if (!$schedule) {
                return $this->notFoundResponse('Booking schedule');
            }

            $booking = $schedule->booking;
            if (!$booking || $booking->user_id !== $user->id) {
                return $this->errorResponse(
                    'You do not have permission to cancel this session.',
                    \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                    [],
                    403
                );
            }

            // Enforce 24‑hour cancellation window and prevent cancelling started/completed sessions
            $start = \Carbon\Carbon::parse($schedule->date->format('Y-m-d') . ' ' . $schedule->start_time);
            $end = \Carbon\Carbon::parse($schedule->date->format('Y-m-d') . ' ' . $schedule->end_time);
            $now = now();

            if ($now->greaterThanOrEqualTo($end)) {
                return $this->errorResponse(
                    'This session has already completed and cannot be cancelled.',
                    \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                    [],
                    400
                );
            }

            if ($now->greaterThanOrEqualTo($start)) {
                return $this->errorResponse(
                    'This session is currently in progress and cannot be cancelled.',
                    \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                    [],
                    400
                );
            }

            $hoursUntilStart = $now->diffInHours($start, false);
            if ($hoursUntilStart < 24) {
                return $this->errorResponse(
                    'Sessions must be cancelled at least 24 hours in advance.',
                    \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                    [],
                    400
                );
            }

            $reason = $request->input('cancellationReason');
            $cancelledSchedule = $this->cancelScheduleAction->execute($id, $reason);

            return $this->successResponse(
                [
                    'schedule' => $this->formatScheduleResponse($cancelledSchedule),
                    'hoursRefunded' => (float) ($cancelledSchedule->duration_hours ?? 0),
                ],
                'Session cancelled successfully.'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Booking schedule');
        } catch (\RuntimeException $e) {
            return $this->errorResponse(
                $e->getMessage(),
                \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                [],
                400
            );
        } catch (\Exception $e) {
            Log::error('Error cancelling booking schedule', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->serverErrorResponse('Failed to cancel session.');
        }
    }
}

