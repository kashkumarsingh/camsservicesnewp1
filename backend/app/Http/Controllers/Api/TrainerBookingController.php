<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Api\ErrorCodes;
use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Models\TimeEntry;
use App\Actions\Booking\CreateBookingScheduleAction;
use App\Contracts\Notifications\INotificationDispatcher;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

/**
 * Trainer Booking Controller
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Handles trainer-specific booking operations
 * Location: backend/app/Http/Controllers/Api/TrainerBookingController.php
 */
class TrainerBookingController extends Controller
{
    use BaseApiController;

    public function __construct(
        private CreateBookingScheduleAction $createScheduleAction
    ) {
    }
    /**
     * Get all bookings assigned to authenticated trainer
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get trainer model linked to this user
        $trainer = \App\Models\Trainer::where('user_id', $user->id)->first();
        
        if (! $trainer) {
            return $this->notFoundResponse('Trainer profile');
        }

        // Get all schedules assigned to this trainer
        $query = BookingSchedule::where('trainer_id', $trainer->id)
            ->with([
                'booking.package',
                'booking.user:id,name,email',
                'booking.participants.child',
                'activities',
            ])
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc');
        
        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }
        
        // Paginate
        $perPage = min($request->get('per_page', 15), 50);
        $schedules = $query->paginate($perPage);
        
        // Group schedules by booking
        $bookingsMap = [];
        foreach ($schedules->items() as $schedule) {
            $bookingId = $schedule->booking_id;
            if (!isset($bookingsMap[$bookingId])) {
                $booking = $schedule->booking;
                $bookingsMap[$bookingId] = [
                    'id' => $booking->id,
                    'reference' => $booking->reference,
                    'package' => [
                        'id' => $booking->package->id,
                        'name' => $booking->package->name,
                        'slug' => $booking->package->slug,
                    ],
                    'parent' => [
                        'name' => $booking->user->name,
                        'email' => $booking->user->email ?? $booking->parent_email ?? null,
                        'phone' => $booking->user->phone ?? $booking->parent_phone ?? null,
                        'address' => $booking->parent_address ?? null,
                        'postcode' => $booking->parent_postcode ?? null,
                        'county' => $booking->parent_county ?? null,
                    ],
                    'participants' => $booking->participants->map(function ($participant) {
                        return [
                            'id' => $participant->id,
                            'child_id' => $participant->child ? $participant->child->id : null,
                            'name' => $participant->child ? $participant->child->name : ($participant->first_name . ' ' . $participant->last_name),
                            'age' => $participant->child ? $participant->child->age : null,
                        ];
                    }),
                    'schedules' => [],
                    'status' => $booking->status,
                    'created_at' => $booking->created_at->toIso8601String(),
                ];
            }
            
            $bookingsMap[$bookingId]['schedules'][] = [
                'id' => $schedule->id,
                'date' => $schedule->date->format('Y-m-d'),
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'status' => $schedule->status,
                'trainer_assignment_status' => $schedule->trainer_assignment_status,
                'location' => $schedule->location ?? null,
                'activities' => $schedule->activities->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'name' => $activity->name,
                        'slug' => $activity->slug,
                    ];
                }),
            ];
        }
        
        return $this->successResponse(
            ['bookings' => array_values($bookingsMap)],
            null,
            [
                'pagination' => [
                    'currentPage' => $schedules->currentPage(),
                    'perPage' => $schedules->perPage(),
                    'total' => $schedules->total(),
                    'lastPage' => $schedules->lastPage(),
                    'hasMore' => $schedules->hasMorePages(),
                    'prevPage' => $schedules->currentPage() > 1 ? $schedules->currentPage() - 1 : null,
                    'nextPage' => $schedules->hasMorePages() ? $schedules->currentPage() + 1 : null,
                ],
            ]
        );
    }

    /**
     * Get detailed booking information
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        
        // Get trainer model
        $trainer = \App\Models\Trainer::where('user_id', $user->id)->first();
        
        if (! $trainer) {
            return $this->notFoundResponse('Trainer profile');
        }

        // Verify trainer is assigned to this booking
        $booking = Booking::with([
            'package',
            'user:id,name,email',
            'participants.child.checklist', // Phase 4: Include checklist for medical/allergy info
            'schedules' => function ($query) use ($trainer) {
                $query->where('trainer_id', $trainer->id)
                    ->with('activities');
            },
        ])->find($id);
        
        if (! $booking) {
            return $this->notFoundResponse('Booking');
        }

        // Check if trainer has any schedules for this booking
        $hasSchedule = $booking->schedules->where('trainer_id', $trainer->id)->count() > 0;
        
        if (! $hasSchedule) {
            return $this->forbiddenResponse('You are not assigned to this booking.');
        }

        // Format response with limited participant information
        return $this->successResponse([
            'booking' => [
                    'id' => $booking->id,
                    'reference' => $booking->reference,
                    'package' => [
                        'id' => $booking->package->id,
                        'name' => $booking->package->name,
                        'slug' => $booking->package->slug,
                    ],
                    'parent' => [
                        'name' => $booking->user->name,
                        'email' => $booking->user->email ?? $booking->parent_email ?? null,
                        'phone' => $booking->user->phone ?? $booking->parent_phone ?? null,
                        'address' => $booking->parent_address ?? null,
                        'postcode' => $booking->parent_postcode ?? null,
                        'county' => $booking->parent_county ?? null,
                    ],
                    'participants' => $booking->participants->map(function ($participant) {
                        $child = $participant->child;
                        $checklist = $child?->checklist;
                        return [
                            'id' => $participant->id,
                            'child_id' => $child ? $child->id : null,
                            'name' => $child ? $child->name : ($participant->first_name . ' ' . $participant->last_name),
                            'age' => $child ? $child->age : null,
                            'medical_info' => $participant->medical_info,
                            'medical_conditions' => $checklist?->medical_conditions,
                            'allergies' => $checklist?->allergies,
                            'medications' => $checklist?->medications,
                            'dietary_requirements' => $checklist?->dietary_requirements,
                            'special_needs' => $participant->special_needs ?? $checklist?->special_needs,
                            'activity_restrictions' => $checklist?->activity_restrictions,
                            'emergency_contact' => $checklist ? [
                                'name' => $checklist->emergency_contact_name,
                                'phone' => $checklist->emergency_contact_phone,
                                'phone_alt' => $checklist->emergency_contact_phone_alt,
                                'relationship' => $checklist->emergency_contact_relationship,
                            ] : null,
                        ];
                    }),
                    'schedules' => $booking->schedules->where('trainer_id', $trainer->id)->map(function ($schedule) {
                        return [
                            'id' => $schedule->id,
                            'date' => $schedule->date->format('Y-m-d'),
                            'start_time' => $schedule->start_time,
                            'end_time' => $schedule->end_time,
                            'status' => $schedule->status,
                            'trainer_assignment_status' => $schedule->trainer_assignment_status,
                            'activities' => $schedule->activities->map(function ($activity) {
                                return [
                                    'id' => $activity->id,
                                    'name' => $activity->name,
                                    'slug' => $activity->slug,
                                ];
                            }),
                        ];
                    }),
                    'status' => $booking->status,
                    'created_at' => $booking->created_at->toIso8601String(),
                ],
        ]);
    }

    /**
     * Update schedule status
     * 
     * @param Request $request
     * @param int $bookingId
     * @param int $scheduleId
     * @return JsonResponse
     */
    public function updateScheduleStatus(Request $request, int $bookingId, int $scheduleId): JsonResponse
    {
        $user = $request->user();
        
        // Get trainer model
        $trainer = \App\Models\Trainer::where('user_id', $user->id)->first();
        
        if (! $trainer) {
            return $this->notFoundResponse('Trainer profile');
        }

        $validator = Validator::make($request->all(), [
            'status' => ['required', 'string', 'in:scheduled,completed,cancelled,no_show,rescheduled'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        // Find schedule and verify trainer ownership
        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('booking_id', $bookingId)
            ->where('trainer_id', $trainer->id)
            ->first();

        if (! $schedule) {
            return $this->errorResponse(
                'Schedule not found or you are not assigned to this schedule.',
                ErrorCodes::RESOURCE_NOT_FOUND,
                [],
                404
            );
        }
        
        // Update status
        $schedule->status = $request->status;
        
        if ($request->status === BookingSchedule::STATUS_COMPLETED) {
            $schedule->completed_at = now();
            if (!$schedule->actual_start_time) {
                $schedule->actual_start_time = $schedule->start_time;
            }
            if (!$schedule->actual_end_time) {
                $schedule->actual_end_time = $schedule->end_time;
            }
        }
        
        if ($request->has('notes')) {
            $schedule->itinerary_notes = array_merge(
                $schedule->itinerary_notes ?? [],
                [
                    [
                        'note' => $request->notes,
                        'added_by' => 'trainer',
                        'added_at' => now()->toIso8601String(),
                    ]
                ]
            );
        }
        
        $schedule->save();

        // If trainer marked completed: notify trainer if they forgot clock-out; notify parent that session is over
        if ($request->status === BookingSchedule::STATUS_COMPLETED) {
            $hasClockOut = TimeEntry::where('booking_schedule_id', $schedule->id)
                ->where('type', TimeEntry::TYPE_CLOCK_OUT)
                ->exists();
            if (! $hasClockOut) {
                app(INotificationDispatcher::class)->dispatch(
                    NotificationIntentFactory::trainerForgotClockOut($schedule->fresh())
                );
            }
            app(INotificationDispatcher::class)->dispatch(
                NotificationIntentFactory::parentSessionOver($schedule->fresh())
            );
        }

        return $this->successResponse(
            [
                'schedule' => [
                    'id' => $schedule->id,
                    'status' => $schedule->status,
                    'actual_start_time' => $schedule->actual_start_time,
                    'actual_end_time' => $schedule->actual_end_time,
                    'completed_at' => $schedule->completed_at?->toIso8601String(),
                ],
            ],
            'Schedule status updated successfully'
        );
    }

    /**
     * Get trainer dashboard statistics
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get trainer model linked to this user
        $trainer = \App\Models\Trainer::where('user_id', $user->id)->first();
        
        if (! $trainer) {
            return $this->notFoundResponse('Trainer profile');
        }

        $today = now()->format('Y-m-d');
        
        // Upcoming Sessions: Count of schedules with date >= today and status = 'scheduled'
        $upcomingSessions = BookingSchedule::where('trainer_id', $trainer->id)
            ->where('date', '>=', $today)
            ->where('status', 'scheduled')
            ->count();
        
        // Total Bookings: Count of unique bookings assigned to trainer
        $totalBookings = BookingSchedule::where('trainer_id', $trainer->id)
            ->distinct()
            ->count('booking_id');
        
        // Today's Schedule: Count of schedules for today
        $todaySchedule = BookingSchedule::where('trainer_id', $trainer->id)
            ->where('date', $today)
            ->count();
        
        // Get recent bookings (last 5) for preview
        $recentBookings = BookingSchedule::where('trainer_id', $trainer->id)
            ->with([
                'booking:id,reference,package_id,status,created_at',
                'booking.package:id,name,slug',
                'booking.user:id,name',
                'booking.participants.child:id,name,age',
            ])
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($schedule) {
                $booking = $schedule->booking;
                return [
                    'id' => $booking->id,
                    'reference' => $booking->reference,
                    'package' => [
                        'name' => $booking->package->name,
                        'slug' => $booking->package->slug,
                    ],
                    'parent' => [
                        'name' => $booking->user->name,
                    ],
                    'participants' => $booking->participants->map(function ($participant) {
                        return [
                            'name' => $participant->child ? $participant->child->name : ($participant->first_name . ' ' . $participant->last_name),
                            'age' => $participant->child ? $participant->child->age : null,
                        ];
                    }),
                    'next_schedule' => [
                        'date' => $schedule->date->format('Y-m-d'),
                        'start_time' => $schedule->start_time,
                        'status' => $schedule->status,
                    ],
                    'status' => $booking->status,
                    'created_at' => $booking->created_at->toIso8601String(),
                ];
            });
        
        return $this->successResponse([
            'stats' => [
                'upcoming_sessions' => $upcomingSessions,
                'total_bookings' => $totalBookings,
                'today_schedule' => $todaySchedule,
            ],
            'recent_bookings' => $recentBookings,
        ]);
    }

    /**
     * Book a session for a booking (trainer can book on behalf of parent).
     *
     * POST /api/v1/trainer/bookings/{bookingId}/schedules
     *
     * This endpoint allows trainers to book sessions for bookings they're assigned to.
     * The trainer must have at least one existing session for the booking to have access.
     *
     * @param Request $request
     * @param int $bookingId
     * @return JsonResponse
     */
    public function bookSession(Request $request, int $bookingId): JsonResponse
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

            // Get trainer model
            $trainer = \App\Models\Trainer::where('user_id', $user->id)->first();
            if (!$trainer) {
                return $this->errorResponse(
                    'Trainer profile not found',
                    \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                    [],
                    404
                );
            }

            // Load booking
            $booking = Booking::find($bookingId);
            if (!$booking) {
                return $this->notFoundResponse('Booking');
            }

            // Verify booking is confirmed and paid
            if ($booking->status !== \App\ValueObjects\Booking\BookingStatus::CONFIRMED) {
                return $this->errorResponse(
                    'Booking must be confirmed before adding sessions',
                    \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                    [],
                    400
                );
            }

            // Authorization: Trainer can book if:
            // 1. Booking has no sessions yet (first session - trainer can book)
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

            // Validate request data
            $validator = Validator::make($request->all(), [
                'date' => ['required', 'date', 'after_or_equal:today'],
                'start_time' => ['required', 'string', 'regex:/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/'],
                'end_time' => ['required', 'string', 'regex:/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/'],
                'activities' => ['nullable', 'array'],
                'activities.*.id' => ['required_with:activities', 'integer', 'exists:activities,id'],
                'mode_key' => ['nullable', 'string', 'max:50'],
                'itinerary_notes' => ['nullable', 'string'],
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors()->toArray());
            }

            // Prepare schedule data with trainer context
            $data = $validator->validated();
            $data['booking_id'] = $bookingId;
            $data['trainer_id'] = $trainer->id; // Automatically set to authenticated trainer
            $data['booked_by'] = 'trainer';
            $data['booked_by_user_id'] = $user->id;

            // Create schedule
            $schedule = $this->createScheduleAction->execute($data);

            Log::info('Trainer booked session', [
                'trainer_id' => $trainer->id,
                'booking_id' => $bookingId,
                'schedule_id' => $schedule->id,
                'date' => $data['date'],
            ]);

            // Format response
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

            $formattedSchedule = [
                'id' => (string) $schedule->id,
                'bookingId' => (string) $schedule->booking_id,
                'date' => $schedule->date->format('Y-m-d'),
                'startTime' => $schedule->start_time,
                'endTime' => $schedule->end_time,
                'durationHours' => (float) $schedule->duration_hours,
                'actualDurationHours' => $schedule->actual_duration_hours ? (float) $schedule->actual_duration_hours : null,
                'trainerId' => $schedule->trainer_id ? (string) $schedule->trainer_id : null,
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
                'bookedBy' => $schedule->booked_by ?? 'trainer',
                'bookedByUserId' => $schedule->booked_by_user_id ? (string) $schedule->booked_by_user_id : null,
                'createdAt' => $schedule->created_at->toIso8601String(),
                'updatedAt' => $schedule->updated_at->toIso8601String(),
            ];

            return $this->successResponse(
                $formattedSchedule,
                'Session booked successfully.',
                [],
                201
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Booking');
        } catch (\RuntimeException $e) {
            return $this->errorResponse(
                $e->getMessage(),
                \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                [],
                400
            );
        } catch (\Exception $e) {
            Log::error('Error booking session as trainer', [
                'trainer_id' => $user->id ?? null,
                'booking_id' => $bookingId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to book session.');
        }
    }
}

