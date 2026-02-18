<?php

namespace App\Actions\Booking;

use App\Actions\Packages\GetPackageAction;
use App\Contracts\Booking\IBookingRepository;
use App\Events\BookingCreated;
use App\Models\Booking;
use App\ValueObjects\Booking\BookingReference;
use App\ValueObjects\Booking\BookingStatus;
use App\ValueObjects\Booking\PaymentStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Create Booking Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for creating bookings
 * Location: backend/app/Actions/Booking/CreateBookingAction.php
 * 
 * This action handles:
 * - Creating a new booking (guest or logged-in user)
 * - Generating unique booking reference
 * - Setting initial status and payment status
 * - Creating participants
 * - Validating package availability
 * 
 * The Application Layer depends on the Domain Layer (Booking model)
 * but is independent of the Interface Layer (Controllers).
 */
class CreateBookingAction
{
    public function __construct(
        private readonly IBookingRepository $bookingRepository,
        private readonly GetPackageAction $getPackageAction
    ) {
    }

    /**
     * Execute the action to create a booking.
     *
     * @param array $data Booking data
     * @param bool $isPostPayment If true, booking is created after payment (CONFIRMED, PAID)
     * @return Booking
     * @throws \Exception
     */
    public function execute(array $data, bool $isPostPayment = false): Booking
    {
        try {
            // Log incoming data to debug mode_key
            Log::info('CreateBookingAction: Incoming data', [
                'has_mode_key' => isset($data['mode_key']),
                'mode_key_value' => $data['mode_key'] ?? 'NOT SET',
                'has_modeKey' => isset($data['modeKey']),
                'modeKey_value' => $data['modeKey'] ?? 'NOT SET',
                'all_keys' => array_keys($data),
            ]);
            
            return DB::transaction(function () use ($data, $isPostPayment) {
            // Require authenticated user (Sanctum authentication)
            // The route already has 'auth:sanctum' middleware, but we double-check here
            $user = auth()->user();
            if (!$user) {
                throw new \Illuminate\Http\Exceptions\HttpResponseException(
                    response()->json([
                        'success' => false,
                        'message' => 'You must be logged in to create a booking.',
                        'errors' => [
                            'authentication' => ['Authentication required to book packages.']
                        ]
                    ], 401)
                );
            }

            // Check user approval status
            if ($user->approval_status !== 'approved') {
                $statusMessage = match($user->approval_status) {
                    'pending' => 'Your account is pending admin approval. You cannot book packages yet.',
                    'rejected' => 'Your account was not approved. Please contact us for more information.',
                    default => 'Your account is not approved for booking packages.',
                };

                throw new \Illuminate\Http\Exceptions\HttpResponseException(
                    response()->json([
                        'success' => false,
                        'message' => $statusMessage,
                        'errors' => [
                            'approval_status' => [$statusMessage]
                        ]
                    ], 403)
                );
            }

            // Validate package exists and is active using Action (Clean Architecture)
            $package = $this->getPackageAction->executeById($data['package_id']);
            
            if (!$package->is_active) {
                throw new \RuntimeException('Package is not active and cannot be booked.');
            }

            // Prevent duplicate bookings: Check if user has recently created a booking for the same package
            // within the last 5 minutes (prevents accidental double-clicks, network retries, etc.)
            $recentBooking = $this->bookingRepository->findRecentBookingByUserAndPackage(
                $user->id,
                $package->id,
                now()->subMinutes(5)
            );

            if ($recentBooking) {
                Log::warning('Duplicate booking attempt prevented', [
                    'user_id' => $user->id,
                    'package_id' => $package->id,
                    'existing_booking_id' => $recentBooking->id,
                    'existing_reference' => $recentBooking->reference,
                    'created_at' => $recentBooking->created_at,
                ]);

                throw new \Illuminate\Http\Exceptions\HttpResponseException(
                    response()->json([
                        'success' => false,
                        'message' => 'You have recently created a booking for this package. Please wait a few minutes before creating another booking, or use your existing booking.',
                        'errors' => [
                            'duplicate_booking' => [
                                'You already have a recent booking for this package. Reference: ' . $recentBooking->reference
                            ]
                        ],
                        'existing_booking' => [
                            'id' => $recentBooking->id,
                            'reference' => $recentBooking->reference,
                            'status' => $recentBooking->status,
                            'created_at' => $recentBooking->created_at->toIso8601String(),
                        ]
                    ], 409) // 409 Conflict
                );
            }

            // Generate unique booking reference
            $postcode = $data['parent_postcode'] ?? 'UNKNOWN';
            $reference = $this->generateUniqueReference($postcode);

            // Set default values (no guest bookings allowed)
            // If isPostPayment is true, booking is created after payment (CONFIRMED, PAID)
            // Otherwise, it's the old flow (DRAFT, PENDING) for backward compatibility
            $bookingData = [
                'reference' => $reference,
                'user_id' => $user->id, // Always use authenticated user
                'is_guest_booking' => false, // Guest bookings blocked
                'guest_email' => null, // No guest bookings
                'guest_phone' => null, // No guest bookings
                'package_id' => $package->id,
                'status' => $isPostPayment ? BookingStatus::CONFIRMED : BookingStatus::DRAFT,
                'payment_status' => $isPostPayment ? PaymentStatus::PAID : PaymentStatus::PENDING,
                'parent_first_name' => $data['parent_first_name'],
                'parent_last_name' => $data['parent_last_name'],
                'parent_email' => $data['parent_email'],
                'parent_phone' => $data['parent_phone'],
                'parent_address' => $data['parent_address'] ?? null,
                'parent_postcode' => $data['parent_postcode'] ?? null,
                'parent_county' => $data['parent_county'] ?? null,
                'emergency_contact' => $data['emergency_contact'] ?? null,
                'total_hours' => $package->hours,
                'booked_hours' => 0,
                'used_hours' => 0,
                'remaining_hours' => $package->hours,
                'total_price' => $package->price,
                'paid_amount' => $isPostPayment ? $package->price : 0, // If post-payment, mark as paid
                'discount_amount' => $data['discount_amount'] ?? 0,
                'discount_reason' => $data['discount_reason'] ?? null,
                'payment_plan' => $data['payment_plan'] ?? null,
                'installment_count' => $data['installment_count'] ?? null,
                'next_payment_due_at' => $data['next_payment_due_at'] ?? null,
                'start_date' => $data['start_date'] ?? null,
                // Calculate package expiry dates from package.duration_weeks if not provided
                'package_expires_at' => $data['package_expires_at'] ?? ($package->duration_weeks ? now()->addWeeks($package->duration_weeks)->toDateString() : null),
                'hours_expires_at' => $data['hours_expires_at'] ?? ($package->duration_weeks ? now()->addWeeks($package->duration_weeks)->toDateString() : null),
                'allow_hour_rollover' => $data['allow_hour_rollover'] ?? false,
                'created_by_admin' => $data['created_by_admin'] ?? false,
                'admin_notes' => $data['admin_notes'] ?? null,
                'notes' => $data['notes'] ?? null,
                'ip_address' => $data['ip_address'] ?? null,
                'user_agent' => $data['user_agent'] ?? null,
                'calculated_fields' => [
                    'mode_key' => $data['mode_key'] ?? $data['modeKey'] ?? null, // Store booking mode for later use when booking sessions
                ],
            ];
            
            // Log what we're about to save
            Log::info('CreateBookingAction: Saving booking with calculated_fields', [
                'mode_key' => $bookingData['calculated_fields']['mode_key'] ?? 'NULL',
                'calculated_fields' => $bookingData['calculated_fields'],
            ]);

            // Create booking
            $booking = $this->bookingRepository->create($bookingData);

            // Create participants if provided
            if (isset($data['participants']) && is_array($data['participants'])) {
                $this->createParticipants($booking, $data['participants'], $package);
            }

            Log::info('Booking created', [
                'booking_id' => $booking->id,
                'reference' => $booking->reference,
                'package_id' => $package->id,
            ]);

            event(new BookingCreated($booking));

            return $booking->load(['package', 'participants', 'schedules.trainer', 'payments']);
            });
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            // Re-throw HttpResponseException (it already has a proper JSON response)
            throw $e;
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Booking creation database error', [
                'message' => $e->getMessage(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'data' => $data,
            ]);
            throw new \RuntimeException('Database error while creating booking: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Booking creation unexpected error', [
                'message' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString(),
                'data' => $data,
            ]);
            throw new \RuntimeException('Failed to create booking: ' . ($e->getMessage() ?: 'Unknown error'));
        }
    }

    /**
     * Generate a unique booking reference.
     *
     * @param string $postcode
     * @return string
     */
    private function generateUniqueReference(string $postcode): string
    {
        $attempts = 0;
        $maxAttempts = 10;

        do {
            $reference = BookingReference::generate($postcode, 'GEN')->value();
            $exists = $this->bookingRepository->referenceExists($reference);
            $attempts++;
        } while ($exists && $attempts < $maxAttempts);

        if ($exists) {
            throw new \RuntimeException('Failed to generate unique booking reference after ' . $maxAttempts . ' attempts.');
        }

        return $reference;
    }

    /**
     * Create participants for the booking.
     * 
     * REQUIRES: All participants must reference approved children (child_id required)
     *
     * @param Booking $booking
     * @param array $participantsData
     * @param \App\Models\Package $package
     * @return void
     * @throws \Exception
     */
    private function createParticipants(Booking $booking, array $participantsData, \App\Models\Package $package): void
    {
        $user = auth()->user();
        
        if (!$user) {
            throw new \Illuminate\Http\Exceptions\HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'You must be logged in to create a booking.',
                    'errors' => [
                        'authentication' => ['Authentication required to book packages.']
                    ]
                ], 401)
            );
        }
        
        foreach ($participantsData as $index => $participantData) {
            // Require child_id for all participants (children must be approved before booking)
            // Pay First flow: child_id is required - children should be selected/approved before booking
            if (!isset($participantData['child_id']) || $participantData['child_id'] === null) {
                throw new \InvalidArgumentException(
                    "Participant at index {$index} is missing required 'child_id'. All participants must reference an approved child. Please select an approved child before booking."
                );
            }

            // Load and validate child
            $child = \App\Models\Child::find($participantData['child_id']);
            
            if (!$child) {
                throw new \InvalidArgumentException(
                    "Child with ID {$participantData['child_id']} not found for participant at index {$index}."
                );
            }

            // Verify child belongs to booking user
            if ($child->user_id !== $user->id) {
                Log::error('Child ownership validation failed', [
                    'child_id' => $child->id,
                    'child_user_id' => $child->user_id,
                    'booking_user_id' => $user->id,
                    'participant_index' => $index,
                ]);
                throw new \Illuminate\Http\Exceptions\HttpResponseException(
                    response()->json([
                        'success' => false,
                        'message' => "Child does not belong to you.",
                        'errors' => [
                            'participants' => ["Child at index {$index} does not belong to the authenticated user."]
                        ]
                    ], 403)
                );
            }

            // Verify child is approved
            if ($child->approval_status !== 'approved') {
                $statusMessage = match($child->approval_status) {
                    'pending' => "Child '{$child->name}' is pending approval and cannot be booked yet.",
                    'rejected' => "Child '{$child->name}' was not approved and cannot be booked.",
                    default => "Child '{$child->name}' is not approved for booking.",
                };

                throw new \Illuminate\Http\Exceptions\HttpResponseException(
                    response()->json([
                        'success' => false,
                        'message' => $statusMessage,
                        'errors' => [
                            'participants' => [$statusMessage]
                        ]
                    ], 403)
                );
            }

            // BUSINESS RULE: One active package per child (regardless of package type)
            // Check if child already has ANY active booking
            // This prevents booking a new package while an existing package is still active
            // Only blocks if the existing booking is still active (not expired)
            if ($child->hasAnyActiveBooking()) {
                $existingBooking = $child->activeBookings()
                    ->with('package')
                    ->orderBy('created_at', 'desc')
                    ->first();

                if ($existingBooking) {
                    $modeName = $existingBooking->mode_name ?? 'Unknown mode';
                    $packageName = $existingBooking->package->name ?? 'this package';
                    $expiresAt = $existingBooking->package_expires_at 
                        ? $existingBooking->package_expires_at->format('Y-m-d') 
                        : 'No expiry set';

                    throw new \Illuminate\Http\Exceptions\HttpResponseException(
                        response()->json([
                            'success' => false,
                            'message' => "Child '{$child->name}' already has an active package ({$packageName}).",
                            'errors' => [
                                'participants' => [
                                    "Child '{$child->name}' already has an active package ({$packageName}). " .
                                    "Each child can only have one active package at a time. " .
                                    "The current package expires on {$expiresAt}. " .
                                    "Please complete or cancel the existing package, or wait until it expires before booking a new package."
                                ]
                            ],
                            'existing_booking' => [
                                'id' => $existingBooking->id,
                                'reference' => $existingBooking->reference,
                                'package' => $packageName,
                                'mode' => $modeName,
                                'status' => $existingBooking->status,
                                'payment_status' => $existingBooking->payment_status,
                                'package_expires_at' => $expiresAt,
                                'has_expired' => $existingBooking->hasExpired(),
                            ]
                        ], 409) // 409 Conflict
                    );
                }
            }

            // Verify child has completed checklist (required for approval)
            if (!$child->checklist || !$child->checklist->checklist_completed) {
                throw new \Illuminate\Http\Exceptions\HttpResponseException(
                    response()->json([
                        'success' => false,
                        'message' => "Child '{$child->name}' does not have a completed checklist. Please complete the UK compliance checklist before booking.",
                        'errors' => [
                            'participants' => ["Child '{$child->name}' requires a completed checklist before booking. Please complete the checklist in your dashboard."]
                        ]
                    ], 403)
                );
            }

            // Get medical info from child checklist if available
            $checklist = $child->checklist;
            $medicalInfo = $checklist?->medical_conditions 
                ? ($checklist->medical_conditions . 
                   ($checklist->allergies ? "\nAllergies: " . $checklist->allergies : '') .
                   ($checklist->medications ? "\nMedications: " . $checklist->medications : ''))
                : ($participantData['medical_info'] ?? null);
            
            $specialNeeds = $checklist?->special_needs ?? ($participantData['special_needs'] ?? null);

            // Split child name into first and last (for backward compatibility)
            $nameParts = explode(' ', $child->name, 2);
            $firstName = $nameParts[0] ?? $child->name;
            $lastName = $nameParts[1] ?? '';

            // Create participant linked to child
            $booking->participants()->create([
                'booking_id' => $booking->id,
                'child_id' => $child->id, // Link to approved child
                'first_name' => $firstName, // Keep for backward compatibility
                'last_name' => $lastName, // Keep for backward compatibility
                'date_of_birth' => $child->date_of_birth ?? ($participantData['date_of_birth'] ?? null),
                'medical_info' => $medicalInfo,
                'special_needs' => $specialNeeds,
                'order' => $index + 1,
            ]);
        }
    }
}

