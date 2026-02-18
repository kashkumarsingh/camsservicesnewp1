<?php

namespace App\Http\Controllers\Api;

use App\Actions\Booking\CancelBookingAction;
use App\Actions\Booking\CreateBookingAction;
use App\Actions\Booking\GetBookingAction;
use App\Actions\Booking\ListBookingsAction;
use App\Actions\Booking\UpdateBookingAction;
use App\Actions\Booking\TopUpBookingAction;
use App\Domain\Booking\Entities\Booking as BookingEntity;
use App\Services\Payment\StripePaymentService;
use App\Domain\Booking\Entities\BookingParticipant;
use App\Domain\Payment\Entities\Payment as PaymentEntity;
use App\Domain\Booking\Entities\BookingSchedule;
use App\Domain\Booking\Mappers\BookingMapper;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Booking Controller (Interface Layer - API)
 * 
 * Clean Architecture: Interface Layer (API Adapter)
 * Purpose: Handles HTTP requests for bookings API endpoints
 * Location: backend/app/Http/Controllers/Api/BookingController.php
 * 
 * This controller:
 * - Receives HTTP requests
 * - Calls Use Cases (Actions) from Application Layer
 * - Formats API responses (JSON) with camelCase keys for frontend compatibility
 * - Handles HTTP-specific concerns (status codes, headers)
 */
class BookingController extends Controller
{
    use BaseApiController;

    public function __construct(
        private CreateBookingAction $createBookingAction,
        private GetBookingAction $getBookingAction,
        private ListBookingsAction $listBookingsAction,
        private UpdateBookingAction $updateBookingAction,
        private CancelBookingAction $cancelBookingAction,
        private TopUpBookingAction $topUpBookingAction,
        private StripePaymentService $stripePaymentService
    ) {
    }

    /**
     * Format booking for API response (camelCase for frontend).
     *
     * @param BookingEntity $booking
     * @return array
     */
    private function formatBookingResponse(BookingEntity $booking): array
    {
        $packageId = $booking->packageId();
        $packageIdInt = is_numeric($packageId) ? (int) $packageId : 0;
        // Get package details including totalWeeks
        $package = $packageIdInt > 0 ? \App\Models\Package::find($packageIdInt) : null;

        return [
            'id' => $booking->id(),
            'reference' => $booking->reference()->value(),
            'packageId' => $packageId,
            'package' => [
                'id' => $packageId,
                'name' => $booking->packageName(),
                'slug' => $booking->packageSlug(),
                'totalWeeks' => $package ? $package->duration_weeks : null, // Include package duration in weeks
                'weeks' => $package ? $package->duration_weeks : null, // Alias for backward compatibility
                'activities' => $packageIdInt > 0 ? $this->getPackageActivities($packageIdInt) : [], // Include package activities
            ],
            'status' => $booking->status()->value(),
            'paymentStatus' => $booking->paymentStatus()->value(),
            'isGuestBooking' => $booking->isGuestBooking(),
            'parentFirstName' => $booking->parentFirstName(),
            'parentLastName' => $booking->parentLastName(),
            'parentFullName' => $booking->parentFullName(),
            'parentEmail' => $booking->parentEmail(),
            'parentPhone' => $booking->parentPhone(),
            'parentAddress' => $booking->parentAddress(),
            'parentPostcode' => $booking->parentPostcode(),
            'parentCounty' => $booking->parentCounty(),
            'emergencyContact' => $booking->emergencyContact(),
            'totalHours' => $booking->totalHours(),
            'bookedHours' => $booking->bookedHours(),
            'usedHours' => $booking->usedHours(),
            'remainingHours' => $booking->remainingHours(),
            'totalPrice' => $booking->totalPrice(),
            'paidAmount' => $booking->paidAmount(),
            'discountAmount' => $booking->discountAmount(),
            'discountReason' => $booking->discountReason(),
            'outstandingAmount' => $booking->outstandingAmount(),
            'paymentPlan' => $booking->paymentPlan(),
            'installmentCount' => $booking->installmentCount(),
            'nextPaymentDueAt' => $booking->nextPaymentDueAt(),
            'startDate' => $booking->startDate(),
            'packageExpiresAt' => $booking->packageExpiresAt(),
            'hoursExpiresAt' => $booking->hoursExpiresAt(),
            'allowHourRollover' => $booking->allowHourRollover(),
            'createdByAdmin' => $booking->createdByAdmin(),
            'notes' => $booking->notes(),
            'cancellationReason' => $booking->cancellationReason(),
            'cancelledAt' => $booking->cancelledAt(),
            'participants' => array_map(
                fn (BookingParticipant $participant) => [
                    'id' => $participant->id(),
                    'childId' => $participant->childId(), // Link back to approved child
                    'firstName' => $participant->firstName(),
                    'lastName' => $participant->lastName(),
                    'fullName' => $participant->fullName(),
                    'dateOfBirth' => $participant->dateOfBirth(),
                    'age' => $participant->age(),
                    'medicalInfo' => $participant->medicalInfo(),
                    'specialNeeds' => $participant->specialNeeds(),
                    'order' => $participant->order(),
                ],
                $booking->participants()
            ),
            'schedules' => array_map(
                function (BookingSchedule $schedule) {
                    // Get activities from the model directly (since entity doesn't include them)
                    $scheduleModel = \App\Models\BookingSchedule::with(['activities', 'trainer'])->find($schedule->id());
                    $activities = $scheduleModel && $scheduleModel->activities 
                        ? $scheduleModel->activities->map(function ($activity) {
                            return [
                                'id' => (string) $activity->id,
                                'name' => $activity->name,
                                'slug' => $activity->slug,
                                'duration' => (float) ($activity->pivot->duration_hours ?? 0),
                                'order' => (int) ($activity->pivot->order ?? 0),
                                'notes' => $activity->pivot->notes ?? null,
                            ];
                        })->values()->toArray()
                        : [];
                    
                    return [
                        'id' => $schedule->id(),
                        'date' => $schedule->date(),
                        'startTime' => $schedule->startTime(),
                        'endTime' => $schedule->endTime(),
                        'durationHours' => $schedule->durationHours(),
                        'actualDurationHours' => $schedule->actualDurationHours(),
                        'trainerId' => $scheduleModel?->trainer_id ? (string) $scheduleModel->trainer_id : null,
                        'autoAssigned' => (bool) ($scheduleModel?->auto_assigned ?? false),
                        'requiresAdminApproval' => (bool) ($scheduleModel?->requires_admin_approval ?? false),
                        'trainerAssignmentStatus' => $scheduleModel?->trainer_assignment_status,
                        'trainerConfirmationRequestedAt' => $scheduleModel?->trainer_confirmation_requested_at?->toIso8601String(),
                        'trainerConfirmedAt' => $scheduleModel?->trainer_confirmed_at?->toIso8601String(),
                        'trainerApprovedAt' => $scheduleModel?->trainer_approved_at?->toIso8601String(),
                        'trainerApprovedByUserId' => $scheduleModel?->trainer_approved_by_user_id ? (string) $scheduleModel->trainer_approved_by_user_id : null,
                        // Prefer the model's trainer; fallback to entity's trainer (from list eager load) so parent always sees assigned trainer.
                        'trainer' => $this->scheduleTrainerForResponse($scheduleModel, $schedule),
                        'status' => $schedule->status(),
                        'modeKey' => $schedule->modeKey(),
                        'order' => $schedule->order(),
                        'activities' => $activities, // Include activities
                        'itineraryNotes' => $schedule->itineraryNotes(), // For custom activity display and edit persistence
                        'location' => $scheduleModel?->location ?? null,
                    ];
                },
                $booking->schedules()
            ),
            'payments' => array_map(
                fn (PaymentEntity $payment) => [
                    'id' => $payment->id(),
                    'amount' => $payment->amount(),
                    'currency' => $payment->currency(),
                    'paymentMethod' => $payment->method()->toString(),
                    'paymentProvider' => $payment->paymentProvider(),
                    'transactionId' => $payment->transactionId(),
                    'status' => $payment->status()->toString(),
                    'processedAt' => $payment->processedAt(),
                    'createdAt' => $payment->createdAt(),
                ],
                $booking->payments()
            ),
            'createdAt' => $booking->createdAt(),
            'updatedAt' => $booking->updatedAt(),
            'modeKey' => $this->extractModeKeyFromBooking($booking), // Extract from calculated_fields
        ];
    }

    /**
     * Build trainer payload for a schedule in API response.
     * Uses schedule model's trainer when loaded; falls back to entity's trainer (e.g. from list eager load) so parents always see assigned trainer.
     *
     * @param \App\Models\BookingSchedule|null $scheduleModel
     * @param BookingSchedule $scheduleEntity
     * @return array|null
     */
    private function scheduleTrainerForResponse(?\App\Models\BookingSchedule $scheduleModel, BookingSchedule $scheduleEntity): ?array
    {
        if ($scheduleModel?->trainer) {
            return [
                'id' => (string) $scheduleModel->trainer->id,
                'name' => $scheduleModel->trainer->name,
                'slug' => $scheduleModel->trainer->slug,
                'avatarUrl' => $scheduleModel->trainer->image,
            ];
        }
        $entityTrainer = $scheduleEntity->trainer();
        if ($entityTrainer && ! empty($entityTrainer['name'])) {
            return [
                'id' => (string) ($entityTrainer['id'] ?? ''),
                'name' => (string) $entityTrainer['name'],
                'slug' => (string) ($entityTrainer['slug'] ?? ''),
                'avatarUrl' => $entityTrainer['avatar'] ?? null,
            ];
        }
        return null;
    }

    /**
     * Extract mode_key from booking's calculated_fields.
     *
     * @param BookingEntity $booking
     * @return string|null
     */
    private function extractModeKeyFromBooking(BookingEntity $booking): ?string
    {
        // Get the underlying model to access calculated_fields
        // This is a pragmatic approach - in a pure DDD setup, we'd add modeKey to the entity
        $model = \App\Models\Booking::find($booking->id());
        if (!$model || !$model->calculated_fields) {
            return null;
        }
        
        $calculatedFields = is_array($model->calculated_fields) 
            ? $model->calculated_fields 
            : json_decode($model->calculated_fields, true);
            
        return $calculatedFields['mode_key'] ?? null;
    }

    /**
     * Get package activities for a booking.
     *
     * @param int $packageId
     * @return array
     */
    private function getPackageActivities(int $packageId): array
    {
        try {
            $package = \App\Models\Package::with(['activities.trainers'])->find($packageId);
            
            if (!$package || !$package->activities) {
                return [];
            }

            return $package->activities->map(function ($activity) {
                return [
                    'id' => (string) $activity->id,
                    'name' => $activity->name,
                    'slug' => $activity->slug,
                    'duration' => (float) $activity->duration,
                    'description' => $activity->description,
                    'trainers' => $activity->trainers->map(function ($trainer) {
                        return [
                            'id' => (string) $trainer->id,
                            'name' => $trainer->name,
                        ];
                    })->toArray(),
                ];
            })->toArray();
        } catch (\Exception $e) {
            \Log::warning('Failed to load package activities', [
                'package_id' => $packageId,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Get all bookings.
     *
     * GET /api/v1/bookings
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'status',
                'payment_status',
                'package_id',
                'user_id',
                'is_guest_booking',
                'parent_email',
                'parent_phone',
                'parent_postcode',
                'date_from',
                'date_to',
                'sort_by',
                'sort_order',
                'include_deleted', // Allow including soft-deleted bookings for debugging
            ]);

            // Security: For authenticated users (parents), automatically filter by their user_id
            // Admins can still filter by user_id explicitly if needed
            $user = auth()->user();
            if ($user && $user->role === 'parent' && !isset($filters['user_id'])) {
                $filters['user_id'] = $user->id;
            }

            $limit = $request->integer('limit', 50);
            $offset = $request->integer('offset', 0);

            // Convert include_deleted to boolean if present
            if (isset($filters['include_deleted'])) {
                $filters['include_deleted'] = filter_var($filters['include_deleted'], FILTER_VALIDATE_BOOLEAN);
            }

            $bookings = $this->listBookingsAction->execute($filters, $limit, $offset);

            // Map bookings to API responses, but gracefully skip any records with invalid
            // domain data (e.g. legacy/demo bookings with malformed references) so that
            // a single bad record does not break the entire parents dashboard.
            $skippedCount = 0;
            $formattedBookings = $bookings
                ->map(function ($booking) use (&$skippedCount) {
                    try {
                        $formatted = $this->formatBookingResponse(BookingMapper::fromModel($booking));
                    } catch (\Throwable $e) {
                        $skippedCount++;
                        // Skip any booking that fails to map (invalid reference, missing package, etc.) so one bad record does not 500 the list
                        Log::warning('Skipping booking with invalid or unmappable data', [
                            'booking_id' => $booking->id ?? null,
                            'reference' => $booking->reference ?? null,
                            'error' => $e->getMessage(),
                            'exception' => get_class($e),
                        ]);
                        return null;
                    }

                    // Include soft-deleted status if booking is trashed
                    if ($booking->trashed()) {
                        $formatted['isDeleted'] = true;
                        $formatted['deletedAt'] = $booking->deleted_at ? $booking->deleted_at->toIso8601String() : null;
                    }

                    return $formatted;
                })
                ->filter() // Remove any null entries from invalid bookings
                ->values();

            $meta = [
                'limit' => $limit,
                'offset' => $offset,
                'total_count' => $bookings->count(),
                'returned' => $formattedBookings->count(),
                'includes_deleted' => isset($filters['include_deleted']) && $filters['include_deleted'],
            ];
            if ($skippedCount > 0) {
                $meta['skipped_count'] = $skippedCount;
                $meta['data_quality_warning'] = 'Some bookings could not be loaded due to data issues. Check logs for details.';
            }

            return $this->collectionResponse(
                $formattedBookings,
                null,
                $meta
            );
        } catch (\Exception $e) {
            Log::error('Error listing bookings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            
            // In testing, return more details
            if (app()->environment('testing') || config('app.debug')) {
                return $this->serverErrorResponse(
                    'Failed to retrieve bookings: ' . $e->getMessage()
                );
            }
            
            return $this->serverErrorResponse('Failed to retrieve bookings.');
        }
    }

    /**
     * Get a booking by ID.
     *
     * GET /api/v1/bookings/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                Log::warning('Unauthenticated user attempted to access booking by ID', [
                    'booking_id' => $id,
                ]);
                return $this->notFoundResponse('Booking');
            }

            $booking = $this->getBookingAction->execute($id);

            // Security: Ensure authenticated user owns this booking
            // Check ownership - bookings created by authenticated users should have user_id set
            // Use strict comparison with type casting to handle int/string mismatches
            $bookingUserId = $booking->user_id ? (int) $booking->user_id : null;
            $currentUserId = (int) $user->id;
            
            Log::info('Booking found, checking ownership', [
                'booking_id' => $booking->id,
                'booking_user_id' => $bookingUserId,
                'current_user_id' => $currentUserId,
                'is_guest_booking' => $booking->is_guest_booking,
            ]);

            // Admins can view any booking without ownership checks
            if (! $user->isAdmin()) {
                // If booking has user_id, it must match current user
                if ($bookingUserId !== null && $bookingUserId !== $currentUserId) {
                    Log::warning('User attempted to access booking they do not own', [
                        'booking_id' => $id,
                        'user_id' => $currentUserId,
                        'booking_user_id' => $bookingUserId,
                        'is_guest_booking' => $booking->is_guest_booking,
                        'user_email' => $user->email,
                    ]);
                    // User doesn't own this booking - return 404 (don't reveal existence)
                    return $this->notFoundResponse('Booking');
                }

                // If booking has no user_id but user is authenticated, allow access
                // (This handles edge cases where user_id might be null due to data issues)
                // For authenticated users, we trust the authentication middleware
                if ($bookingUserId === null) {
                    Log::info('Booking has no user_id - allowing access for authenticated user', [
                        'booking_id' => $booking->id,
                        'user_id' => $currentUserId,
                        'is_guest_booking' => $booking->is_guest_booking,
                    ]);
                }
            }

            return $this->successResponse(
                $this->formatBookingResponse(BookingMapper::fromModel($booking))
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Booking');
        } catch (\Illuminate\Contracts\Support\MessageBag $e) {
            // Handle validation errors
            return $this->validationErrorResponse($e->toArray());
        } catch (\Exception $e) {
            Log::error('Error retrieving booking', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return $this->serverErrorResponse('Failed to retrieve booking.');
        }
    }

    /**
     * Get a booking by reference.
     *
     * GET /api/v1/bookings/reference/{reference}
     *
     * @param string $reference
     * @return JsonResponse
     */
    public function showByReference(string $reference): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                Log::warning('Unauthenticated user attempted to access booking by reference', [
                    'reference' => $reference,
                ]);
                return $this->notFoundResponse('Booking');
            }

            // Decode URL-encoded reference (in case of special characters)
            $reference = urldecode($reference);
            
            Log::info('Attempting to retrieve booking by reference', [
                'reference' => $reference,
                'user_id' => $user->id,
                'user_email' => $user->email,
            ]);
            
            try {
                $booking = $this->getBookingAction->executeByReference($reference);
            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                Log::error('Booking not found in repository', [
                    'reference' => $reference,
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
            
            if (!$booking) {
                Log::error('Booking is null after repository lookup', [
                    'reference' => $reference,
                    'user_id' => $user->id,
                ]);
                return $this->notFoundResponse('Booking');
            }

            // Security: Ensure authenticated user owns this booking
            // Check ownership - bookings created by authenticated users should have user_id set
            // Use strict comparison with type casting to handle int/string mismatches
            $bookingUserId = $booking->user_id ? (int) $booking->user_id : null;
            $currentUserId = (int) $user->id;
            
            Log::info('Booking found, checking ownership', [
                'reference' => $reference,
                'booking_id' => $booking->id,
                'booking_user_id' => $bookingUserId,
                'current_user_id' => $currentUserId,
                'is_guest_booking' => $booking->is_guest_booking,
            ]);

            // Admins can view any booking without ownership checks
            if (! $user->isAdmin()) {
                // If booking has user_id, it must match current user
                if ($bookingUserId !== null && $bookingUserId !== $currentUserId) {
                    Log::warning('User attempted to access booking they do not own', [
                        'reference' => $reference,
                        'user_id' => $currentUserId,
                        'booking_user_id' => $bookingUserId,
                        'is_guest_booking' => $booking->is_guest_booking,
                        'user_email' => $user->email,
                    ]);
                    // User doesn't own this booking - return 404 (don't reveal existence)
                    return $this->notFoundResponse('Booking');
                }

                // If booking has no user_id but user is authenticated, allow access
                // (This handles edge cases where user_id might be null due to data issues)
                // For authenticated users, we trust the authentication middleware
                if ($bookingUserId === null) {
                    Log::info('Booking has no user_id - allowing access for authenticated user', [
                        'reference' => $reference,
                        'booking_id' => $booking->id,
                        'user_id' => $currentUserId,
                        'is_guest_booking' => $booking->is_guest_booking,
                    ]);
                }
            }

            return $this->successResponse(
                $this->formatBookingResponse(BookingMapper::fromModel($booking))
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::info('Booking not found by reference', [
                'reference' => $reference,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);
            return $this->notFoundResponse('Booking');
        } catch (\Exception $e) {
            Log::error('Error retrieving booking by reference', [
                'reference' => $reference,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return $this->serverErrorResponse('Failed to retrieve booking.');
        }
    }

    /**
     * Create a new booking.
     *
     * POST /api/v1/bookings
     *
     * @param StoreBookingRequest $request
     * @return JsonResponse
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['ip_address'] = $request->ip();
            $data['user_agent'] = $request->userAgent();
            
            // Log what we're passing to CreateBookingAction
            Log::info('BookingController::store: Validated data', [
                'has_mode_key' => isset($data['mode_key']),
                'mode_key_value' => $data['mode_key'] ?? 'NOT SET',
                'has_modeKey' => isset($data['modeKey']),
                'modeKey_value' => $data['modeKey'] ?? 'NOT SET',
            ]);

            $booking = $this->createBookingAction->execute($data);

            return $this->successResponse(
                $this->formatBookingResponse(BookingMapper::fromModel($booking)),
                'Booking created successfully.',
                [],
                201
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Booking creation ModelNotFoundException', [
                'message' => $e->getMessage(),
                'model' => $e->getModel(),
                'ids' => $e->getIds(),
                'data' => $request->all(),
            ]);
            return $this->errorResponse(
                'The selected package does not exist or is not available for booking.',
                \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                ['package_id' => ['The selected package does not exist or is not available.']],
                400
            );
        } catch (\InvalidArgumentException $e) {
            Log::error('Booking creation InvalidArgumentException', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all(),
            ]);
            return $this->errorResponse(
                $e->getMessage() ?: 'Invalid booking data provided.',
                \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                [],
                400
            );
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            // HttpResponseException already contains a proper JSON response - just return it
            $response = $e->getResponse();
            
            // Log for debugging
            Log::info('Booking creation HttpResponseException', [
                'status' => $response->getStatusCode(),
                'content' => $response->getContent(),
            ]);
            
            return $response;
        } catch (\RuntimeException $e) {
            Log::error('Booking creation RuntimeException', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all(),
            ]);
            $errorMessage = $e->getMessage() ?: 'Failed to create booking. Please check your details and try again.';
            return $this->errorResponse($errorMessage, \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR, [], 400);
        } catch (\Exception $e) {
            Log::error('Error creating booking', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all(),
            ]);
            
            return $this->serverErrorResponse('Failed to create booking.');
        }
    }

    /**
     * Create booking after payment confirmation (Pay First → Book Later flow).
     *
     * POST /api/v1/bookings/create-after-payment
     *
     * This endpoint creates a booking AFTER payment has been confirmed.
     * Booking is created with CONFIRMED status and PAID payment status.
     * Sessions are NOT created here - they'll be added later via separate endpoint.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createAfterPayment(Request $request): JsonResponse
    {
        // Convert camelCase to snake_case for mode_key before validation
        $data = $request->all();
        if (isset($data['modeKey']) && !isset($data['mode_key'])) {
            $data['mode_key'] = $data['modeKey'];
            $request->merge($data);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'package_id' => ['required', 'integer', 'exists:packages,id'],
            'payment_intent_id' => ['required', 'string'],
            'parent_first_name' => ['required', 'string', 'max:255'],
            'parent_last_name' => ['required', 'string', 'max:255'],
            'parent_email' => ['required', 'email', 'max:255'],
            'parent_phone' => ['required', 'string', 'max:255'],
            'parent_address' => ['nullable', 'string'],
            'parent_postcode' => ['nullable', 'string', 'max:255'],
            'parent_county' => ['nullable', 'string', 'max:255'],
            'emergency_contact' => ['nullable', 'string'],
            'participants' => ['required', 'array', 'min:1'],
            'participants.*.child_id' => ['nullable', 'integer', 'exists:children,id'],
            'participants.*.first_name' => ['required_without:participants.*.child_id', 'string', 'max:255'],
            'participants.*.last_name' => ['required_without:participants.*.child_id', 'string', 'max:255'],
            'participants.*.age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'start_date' => ['nullable', 'date', 'after_or_equal:today'],
            'package_expires_at' => ['nullable', 'date', 'after:today'],
            'hours_expires_at' => ['nullable', 'date', 'after:today'],
            'notes' => ['nullable', 'string'],
            'mode_key' => ['nullable', 'string', 'max:50'], // Booking mode selected during payment
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        try {
            // Verify payment was successful
            $paymentService = app(\App\Contracts\Payment\IPaymentService::class);
            $paymentStatus = $paymentService->getPaymentStatus($request->input('payment_intent_id'));

            if (!$paymentStatus['success'] || $paymentStatus['status'] !== 'completed') {
                return $this->errorResponse(
                    'Payment must be confirmed before creating booking. Payment status: ' . ($paymentStatus['status'] ?? 'unknown'),
                    \App\Http\Controllers\Api\ErrorCodes::PAYMENT_ERROR,
                    [],
                    400
                );
            }

            // Prepare booking data
            $data = $validator->validated();
            $data['ip_address'] = $request->ip();
            $data['user_agent'] = $request->userAgent();

            // Create booking with isPostPayment = true (CONFIRMED, PAID)
            $booking = $this->createBookingAction->execute($data, isPostPayment: true);

            Log::info('Booking created after payment', [
                'booking_id' => $booking->id,
                'reference' => $booking->reference,
                'payment_intent_id' => $request->input('payment_intent_id'),
            ]);

            return $this->successResponse(
                $this->formatBookingResponse(BookingMapper::fromModel($booking)),
                'Package purchased successfully. You can now book your sessions.',
                [],
                201
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Package');
        } catch (\InvalidArgumentException $e) {
            Log::error('Booking creation after payment InvalidArgumentException', [
                'message' => $e->getMessage(),
                'data' => $request->all(),
            ]);
            return $this->errorResponse(
                $e->getMessage() ?: 'Invalid booking data provided.',
                \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                [],
                400
            );
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            return $e->getResponse();
        } catch (\Exception $e) {
            Log::error('Error creating booking after payment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all(),
            ]);
            return $this->serverErrorResponse('Failed to create booking after payment.');
        }
    }

    /**
     * Update a booking.
     *
     * PUT /api/v1/bookings/{id}
     *
     * @param int $id
     * @param UpdateBookingRequest $request
     * @return JsonResponse
     */
    public function update(int $id, UpdateBookingRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $booking = $this->updateBookingAction->execute($id, $data);

            return $this->successResponse(
                $this->formatBookingResponse(BookingMapper::fromModel($booking)),
                'Booking updated successfully.'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Booking');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR, [], 400);
        } catch (\Exception $e) {
            Log::error('Error updating booking', ['id' => $id, 'error' => $e->getMessage()]);
            
            return $this->serverErrorResponse('Failed to update booking.');
        }
    }

    /**
     * Get booked dates for a specific child.
     *
     * GET /api/v1/children/{childId}/booked-dates
     *
     * @param int $childId
     * @param Request $request
     * @return JsonResponse
     */
    public function getBookedDatesForChild(int $childId, Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return $this->notFoundResponse('Child');
            }

            // Security: Ensure the child belongs to the authenticated user
            $child = \App\Models\Child::where('id', $childId)
                ->where('user_id', $user->id)
                ->first();

            if (!$child) {
                Log::warning('User attempted to access child they do not own', [
                    'child_id' => $childId,
                    'user_id' => $user->id,
                ]);
                return $this->notFoundResponse('Child');
            }

            // Get all booking schedules for bookings that include this child as a participant
            // Only include active bookings (exclude cancelled and refunded)
            $bookedDates = \App\Models\BookingSchedule::whereHas('booking', function ($query) use ($childId) {
                $query->whereHas('participants', function ($participantQuery) use ($childId) {
                    $participantQuery->where('child_id', $childId);
                })
                ->whereIn('status', ['draft', 'pending', 'confirmed'])
                ->where('payment_status', '!=', 'refunded');
            })
            ->where('status', '!=', 'cancelled')
            ->where('date', '>=', now()->format('Y-m-d'))
            ->distinct()
            ->pluck('date')
            ->map(function ($date) {
                return $date instanceof \DateTime ? $date->format('Y-m-d') : $date;
            })
            ->unique()
            ->sort()
            ->values()
            ->toArray();

            Log::info('Retrieved booked dates for child', [
                'child_id' => $childId,
                'user_id' => $user->id,
                'booked_dates_count' => count($bookedDates),
            ]);

            return $this->successResponse([
                'child_id' => (string) $childId,
                'booked_dates' => $bookedDates,
                'count' => count($bookedDates),
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving booked dates for child', [
                'child_id' => $childId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->serverErrorResponse('Failed to retrieve booked dates.');
        }
    }

    /**
     * Get active bookings for a child with package and mode information.
     *
     * GET /api/v1/children/{childId}/active-bookings
     *
     * @param int $childId
     * @param Request $request
     * @return JsonResponse
     */
    public function getActiveBookingsForChild(int $childId, Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return $this->notFoundResponse('Child');
            }

            // Security: Ensure the child belongs to the authenticated user
            $child = \App\Models\Child::where('id', $childId)
                ->where('user_id', $user->id)
                ->first();

            if (!$child) {
                Log::warning('User attempted to access child they do not own', [
                    'child_id' => $childId,
                    'user_id' => $user->id,
                ]);
                return $this->notFoundResponse('Child');
            }

            // Get active bookings with package and mode information
            $activeBookings = $child->getActiveBookingsWithDetails();

            Log::info('Retrieved active bookings for child', [
                'child_id' => $childId,
                'user_id' => $user->id,
                'bookings_count' => $activeBookings->count(),
            ]);

            return $this->successResponse([
                'child_id' => (string) $childId,
                'child_name' => $child->name,
                'active_bookings' => $activeBookings,
                'count' => $activeBookings->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving booked dates for child', [
                'child_id' => $childId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve booked dates.');
        }
    }

    /**
     * Cancel a booking.
     *
     * POST /api/v1/bookings/{id}/cancel
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function cancel(int $id, Request $request): JsonResponse
    {
        try {
            $reason = $request->input('reason');
            $booking = $this->cancelBookingAction->execute($id, $reason);

            return $this->successResponse(
                $this->formatBookingResponse(BookingMapper::fromModel($booking)),
                'Booking cancelled successfully.'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Booking');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR, [], 400);
        } catch (\Exception $e) {
            Log::error('Error cancelling booking', ['id' => $id, 'error' => $e->getMessage()]);
            
            return $this->serverErrorResponse('Failed to cancel booking.');
        }
    }

    /**
     * Start a top-up for an existing booking (add hours + create payment intent).
     *
     * POST /api/v1/bookings/{id}/top-up
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function topUp(int $id, Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'hours' => ['required', 'numeric', 'min:1', 'max:100'],
            'currency' => ['nullable', 'string', 'size:3'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        $data = $validator->validated();

        try {
            $result = $this->topUpBookingAction->execute(
                $id,
                (float) $data['hours'],
                $data['currency'] ?? 'GBP'
            );

            return $this->successResponse(
                $result,
                'Top-up started successfully. Redirecting to payment.',
                [],
                201
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Booking');
        } catch (\RuntimeException $e) {
            return $this->errorResponse(
                $e->getMessage() ?: 'Unable to top up this booking.',
                \App\Http\Controllers\Api\ErrorCodes::BOOKING_ERROR,
                [],
                400
            );
        } catch (\Exception $e) {
            Log::error('Error starting booking top-up', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to start booking top-up.');
        }
    }
}

