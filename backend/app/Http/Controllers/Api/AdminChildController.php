<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Child;
use App\Models\ChildChecklist;
use App\Models\User;
use App\Models\UserNotification;
use App\Services\Notifications\DashboardNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Admin Child Controller (Interface Layer - API)
 *
 * Clean Architecture: Interface Layer (API Adapter)
 * Purpose: Provides admin-only endpoints for viewing children and their parents
 * Guards: Protected by auth:sanctum + admin middleware (see routes/api.php)
 */
class AdminChildController extends Controller
{
    use BaseApiController;

    /**
     * List children for the admin dashboard.
     *
     * GET /api/v1/admin/children
     *
     * Supported query parameters:
     * - approval_status: filter by approval status (pending, approved, rejected)
     * - age_min: minimum age filter
     * - age_max: maximum age filter
     * - parent_id: filter by parent ID
     * - search: search by child name, parent name, or parent email
     * - hours: "0" to show only children with 0 remaining hours (confirmed booking)
     * - limit: max number of records to return (default: 100, max: 200)
     * - offset: offset for pagination (default: 0)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Child::query()->with([
                'user',
                'approvedBy',
                'checklist',
                'bookings' => function ($q) {
                    $q->where('bookings.status', Booking::STATUS_CONFIRMED)
                      ->orderByDesc('bookings.updated_at');
                },
            ]);

            // Filter by approval status
            if ($approvalStatus = $request->query('approval_status')) {
                $query->where('approval_status', $approvalStatus);
            }

            // Filter by age range
            if ($ageMin = $request->query('age_min')) {
                $query->where('age', '>=', (int) $ageMin);
            }
            if ($ageMax = $request->query('age_max')) {
                $query->where('age', '<=', (int) $ageMax);
            }

            // Filter by parent ID
            if ($parentId = $request->query('parent_id')) {
                $query->where('user_id', $parentId);
            }

            // Search by child name, parent name, or parent email
            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'LIKE', "%{$search}%")
                                    ->orWhere('email', 'LIKE', "%{$search}%");
                      });
                });
            }

            // Filter: only children with 0 remaining hours (participant on a confirmed booking with remaining_hours <= 0)
            if ($request->query('hours') === '0') {
                $query->whereHas('bookingParticipants', function ($q) {
                    $q->whereHas('booking', function ($q2) {
                        $q2->where('status', Booking::STATUS_CONFIRMED)
                           ->where('remaining_hours', '<=', 0);
                    });
                });
            }

            $limit = max(1, min($request->integer('limit', 100), 200));
            $offset = max(0, $request->integer('offset', 0));

            $totalCount = (clone $query)->count();

            $children = $query
                ->orderByDesc('created_at')
                ->skip($offset)
                ->take($limit)
                ->get();

            $formatted = $children->map(function (Child $child) {
                $parent = $child->user;
                $approvedBy = $child->approvedBy;
                $checklist = $child->checklist;
                $latestConfirmedBooking = $child->bookings->sortByDesc('updated_at')->first();
                $remainingHours = $latestConfirmedBooking !== null
                    ? (float) $latestConfirmedBooking->remaining_hours
                    : null;

                return [
                    'id' => (string) $child->id,
                    'name' => $child->name,
                    'age' => $child->age,
                    'dateOfBirth' => $child->date_of_birth ? $child->date_of_birth->toDateString() : null,
                    'gender' => $child->gender,
                    'address' => $child->address,
                    'postcode' => $child->postcode,
                    'city' => $child->city,
                    'region' => $child->region,
                    'approvalStatus' => $child->approval_status,
                    'approvedAt' => $child->approved_at ? $child->approved_at->toIso8601String() : null,
                    'approvedByName' => $approvedBy?->name,
                    'rejectionReason' => $child->rejection_reason,
                    'rejectedAt' => $child->rejected_at ? $child->rejected_at->toIso8601String() : null,
                    'parentId' => $parent ? (string) $parent->id : null,
                    'parentName' => $parent?->name,
                    'parentEmail' => $parent?->email,
                    'parentPhone' => $parent?->phone,
                    'hasChecklist' => (bool) $checklist,
                    'checklistCompleted' => (bool) optional($checklist)->checklist_completed,
                    'checklistCompletedAt' => $checklist?->checklist_completed_at?->toIso8601String(),
                    'remainingHours' => $remainingHours,
                    'createdAt' => $child->created_at ? $child->created_at->toIso8601String() : null,
                    'updatedAt' => $child->updated_at ? $child->updated_at->toIso8601String() : null,
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
            Log::error('Error listing admin children', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve children for admin dashboard.');
        }
    }

    /**
     * Get a single child by ID.
     *
     * GET /api/v1/admin/children/{id}
     */
    public function show(string $id): JsonResponse
    {
        try {
            $child = Child::with(['user', 'approvedBy', 'bookings.package', 'checklist'])
                ->findOrFail($id);

            $parent = $child->user;
            $approvedBy = $child->approvedBy;
            $checklist = $child->checklist;
            $checklistData = $checklist ? [
                'id' => $checklist->id,
                'child_id' => $checklist->child_id,
                'medical_conditions' => $checklist->medical_conditions,
                'allergies' => $checklist->allergies,
                'medications' => $checklist->medications,
                'dietary_requirements' => $checklist->dietary_requirements,
                'emergency_contact_name' => $checklist->emergency_contact_name,
                'emergency_contact_relationship' => $checklist->emergency_contact_relationship,
                'emergency_contact_phone' => $checklist->emergency_contact_phone,
                'emergency_contact_phone_alt' => $checklist->emergency_contact_phone_alt,
                'emergency_contact_address' => $checklist->emergency_contact_address,
                'special_needs' => $checklist->special_needs,
                'behavioral_notes' => $checklist->behavioral_notes,
                'activity_restrictions' => $checklist->activity_restrictions,
                'consent_photography' => $checklist->consent_photography,
                'consent_medical_treatment' => $checklist->consent_medical_treatment,
                'checklist_completed' => $checklist->checklist_completed,
                'checklist_completed_at' => $checklist->checklist_completed_at?->toIso8601String(),
                'created_at' => $checklist->created_at?->toIso8601String(),
                'updated_at' => $checklist->updated_at?->toIso8601String(),
            ] : null;

            $bookings = $child->bookings->map(function ($booking) {
                return [
                    'id' => (string) $booking->id,
                    'reference' => $booking->reference,
                    'packageName' => $booking->package?->name,
                    'status' => $booking->status,
                    'paymentStatus' => $booking->payment_status,
                    'createdAt' => $booking->created_at?->toIso8601String(),
                ];
            });

            $data = [
                'id' => (string) $child->id,
                'name' => $child->name,
                'age' => $child->age,
                'dateOfBirth' => $child->date_of_birth ? $child->date_of_birth->toDateString() : null,
                'gender' => $child->gender,
                'address' => $child->address,
                'postcode' => $child->postcode,
                'city' => $child->city,
                'region' => $child->region,
                'approvalStatus' => $child->approval_status,
                'approvedAt' => $child->approved_at ? $child->approved_at->toIso8601String() : null,
                'approvedByName' => $approvedBy?->name,
                'rejectionReason' => $child->rejection_reason,
                'rejectedAt' => $child->rejected_at ? $child->rejected_at->toIso8601String() : null,
                'parentId' => $parent ? (string) $parent->id : null,
                'parentName' => $parent?->name,
                'parentEmail' => $parent?->email,
                'parentPhone' => $parent?->phone,
                'hasChecklist' => (bool) $checklist,
                'checklistCompleted' => (bool) optional($checklist)->checklist_completed,
                'checklistCompletedAt' => $checklist?->checklist_completed_at?->toIso8601String(),
                'checklist' => $checklistData,
                'bookings' => $bookings,
                'createdAt' => $child->created_at ? $child->created_at->toIso8601String() : null,
                'updatedAt' => $child->updated_at ? $child->updated_at->toIso8601String() : null,
            ];

            return $this->successResponse($data);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Child not found.');
        } catch (\Exception $e) {
            Log::error('Error retrieving admin child', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve child.');
        }
    }

    /**
     * Create a new child.
     *
     * POST /api/v1/admin/children
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'name' => 'required|string|max:100',
                'age' => 'required|integer|min:0|max:255',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
                'address' => 'nullable|string',
                'postcode' => 'nullable|string|max:10',
                'city' => 'nullable|string|max:100',
                'region' => 'nullable|string|max:100',
                'approval_status' => 'nullable|in:pending,approved,rejected',
            ]);

            // Auto-approve if approval_status is not provided
            if (!isset($validated['approval_status'])) {
                $validated['approval_status'] = 'pending';
            }

            $child = Child::create($validated);

            // Load relationships
            $child->load(['user', 'approvedBy', 'checklist']);

            $parent = $child->user;
            $approvedBy = $child->approvedBy;
            $checklist = $child->checklist;

            $data = [
                'id' => (string) $child->id,
                'name' => $child->name,
                'age' => $child->age,
                'dateOfBirth' => $child->date_of_birth ? $child->date_of_birth->toDateString() : null,
                'gender' => $child->gender,
                'address' => $child->address,
                'postcode' => $child->postcode,
                'city' => $child->city,
                'region' => $child->region,
                'approvalStatus' => $child->approval_status,
                'approvedAt' => $child->approved_at ? $child->approved_at->toIso8601String() : null,
                'approvedByName' => $approvedBy?->name,
                'rejectionReason' => $child->rejection_reason,
                'rejectedAt' => $child->rejected_at ? $child->rejected_at->toIso8601String() : null,
                'parentId' => $parent ? (string) $parent->id : null,
                'parentName' => $parent?->name,
                'parentEmail' => $parent?->email,
                'parentPhone' => $parent?->phone,
                'hasChecklist' => (bool) $checklist,
                'checklistCompleted' => (bool) optional($checklist)->checklist_completed,
                'checklistCompletedAt' => $checklist?->checklist_completed_at?->toIso8601String(),
                'createdAt' => $child->created_at ? $child->created_at->toIso8601String() : null,
                'updatedAt' => $child->updated_at ? $child->updated_at->toIso8601String() : null,
            ];

            return $this->createdResponse($data, 'Child created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error creating admin child', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to create child.');
        }
    }

    /**
     * Update an existing child.
     *
     * PUT /api/v1/admin/children/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $child = Child::findOrFail($id);

            $validated = $request->validate([
                'user_id' => 'sometimes|exists:users,id',
                'name' => 'sometimes|string|max:100',
                'age' => 'sometimes|integer|min:0|max:255',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
                'address' => 'nullable|string',
                'postcode' => 'nullable|string|max:10',
                'city' => 'nullable|string|max:100',
                'region' => 'nullable|string|max:100',
            ]);

            $child->update($validated);

            // Reload relationships
            $child->load(['user', 'approvedBy', 'checklist']);

            $parent = $child->user;
            $approvedBy = $child->approvedBy;
            $checklist = $child->checklist;

            $data = [
                'id' => (string) $child->id,
                'name' => $child->name,
                'age' => $child->age,
                'dateOfBirth' => $child->date_of_birth ? $child->date_of_birth->toDateString() : null,
                'gender' => $child->gender,
                'address' => $child->address,
                'postcode' => $child->postcode,
                'city' => $child->city,
                'region' => $child->region,
                'approvalStatus' => $child->approval_status,
                'approvedAt' => $child->approved_at ? $child->approved_at->toIso8601String() : null,
                'approvedByName' => $approvedBy?->name,
                'rejectionReason' => $child->rejection_reason,
                'rejectedAt' => $child->rejected_at ? $child->rejected_at->toIso8601String() : null,
                'parentId' => $parent ? (string) $parent->id : null,
                'parentName' => $parent?->name,
                'parentEmail' => $parent?->email,
                'parentPhone' => $parent?->phone,
                'hasChecklist' => (bool) $checklist,
                'checklistCompleted' => (bool) optional($checklist)->checklist_completed,
                'checklistCompletedAt' => $checklist?->checklist_completed_at?->toIso8601String(),
                'createdAt' => $child->created_at ? $child->created_at->toIso8601String() : null,
                'updatedAt' => $child->updated_at ? $child->updated_at->toIso8601String() : null,
            ];

            return $this->successResponse($data, 'Child updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Child not found.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error updating admin child', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to update child.');
        }
    }

    /**
     * Delete a child.
     *
     * DELETE /api/v1/admin/children/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $child = Child::findOrFail($id);

            // Check if child can be deleted (only when no bookings, payments, or session history)
            if (! $child->isDeletionAllowed()) {
                $message = 'Cannot delete this child. The child has existing bookings, payments, or session history. Archive the child instead to preserve records.';
                return $this->validationErrorResponse(
                    ['child' => [$message]],
                    $message
                );
            }

            $child->delete();

            return $this->successResponse(null, 'Child deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Child not found.');
        } catch (\Exception $e) {
            Log::error('Error deleting admin child', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to delete child.');
        }
    }

    /**
     * Approve a child.
     *
     * POST /api/v1/admin/children/{id}/approve
     */
    public function approve(string $id): JsonResponse
    {
        try {
            $child = Child::findOrFail($id);

            if ($child->approval_status === Child::STATUS_APPROVED) {
                return $this->validationErrorResponse([
                    'child' => ['Child is already approved.'],
                ]);
            }

            // Enforce checklist completion before approval
            if (!$child->checklist || !$child->checklist->checklist_completed) {
                return $this->validationErrorResponse([
                    'checklist' => ['Child checklist must be completed before approval.'],
                ]);
            }

            $child->update([
                'approval_status' => Child::STATUS_APPROVED,
                'approved_at' => now(),
                'approved_by' => auth()->id(),
                'rejection_reason' => null,
                'rejected_at' => null,
            ]);

            // Reload relationships
            $child->load(['user', 'approvedBy', 'checklist']);

            $parent = $child->user;
            $approvedBy = $child->approvedBy;
            $checklist = $child->checklist;

            app(\App\Contracts\Notifications\INotificationDispatcher::class)
                ->dispatch(\App\Services\Notifications\NotificationIntentFactory::childApproved($child));

            $data = [
                'id' => (string) $child->id,
                'name' => $child->name,
                'age' => $child->age,
                'dateOfBirth' => $child->date_of_birth ? $child->date_of_birth->toDateString() : null,
                'gender' => $child->gender,
                'address' => $child->address,
                'postcode' => $child->postcode,
                'city' => $child->city,
                'region' => $child->region,
                'approvalStatus' => $child->approval_status,
                'approvedAt' => $child->approved_at ? $child->approved_at->toIso8601String() : null,
                'approvedByName' => $approvedBy?->name,
                'rejectionReason' => $child->rejection_reason,
                'rejectedAt' => $child->rejected_at ? $child->rejected_at->toIso8601String() : null,
                'parentId' => $parent ? (string) $parent->id : null,
                'parentName' => $parent?->name,
                'parentEmail' => $parent?->email,
                'parentPhone' => $parent?->phone,
                'hasChecklist' => (bool) $checklist,
                'checklistCompleted' => (bool) optional($checklist)->checklist_completed,
                'checklistCompletedAt' => $checklist?->checklist_completed_at?->toIso8601String(),
                'createdAt' => $child->created_at ? $child->created_at->toIso8601String() : null,
                'updatedAt' => $child->updated_at ? $child->updated_at->toIso8601String() : null,
            ];

            return $this->successResponse($data, 'Child approved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Child not found.');
        } catch (\Exception $e) {
            Log::error('Error approving admin child', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to approve child.');
        }
    }

    /**
     * Mark the child's checklist as completed (admin review done) and, if child is pending, auto-approve the child.
     *
     * POST /api/v1/admin/children/{id}/complete-checklist
     */
    public function completeChecklist(string $id): JsonResponse
    {
        try {
            $child = Child::with(['user', 'approvedBy', 'checklist'])->findOrFail($id);

            if (!$child->checklist) {
                return $this->validationErrorResponse([
                    'checklist' => ['This child has no checklist to complete. Ask the parent to submit one first.'],
                ]);
            }

            $checklist = $child->checklist;
            if ($checklist->checklist_completed) {
                return $this->validationErrorResponse([
                    'checklist' => ['This checklist is already marked as completed.'],
                ]);
            }

            $checklist->update([
                'checklist_completed' => true,
                'checklist_completed_at' => now(),
                'checklist_completed_by' => auth()->id(),
            ]);

            if ($child->approval_status === Child::STATUS_PENDING) {
                $child->update([
                    'approval_status' => Child::STATUS_APPROVED,
                    'approved_at' => now(),
                    'approved_by' => auth()->id(),
                    'rejection_reason' => null,
                    'rejected_at' => null,
                ]);
            }

            $child->load(['user', 'approvedBy', 'checklist']);
            $parent = $child->user;
            $approvedBy = $child->approvedBy;
            $checklist = $child->checklist;

            if ($child->approval_status === Child::STATUS_APPROVED) {
                app(\App\Contracts\Notifications\INotificationDispatcher::class)
                    ->dispatch(\App\Services\Notifications\NotificationIntentFactory::childApproved($child));
            }

            $data = [
                'id' => (string) $child->id,
                'name' => $child->name,
                'age' => $child->age,
                'dateOfBirth' => $child->date_of_birth ? $child->date_of_birth->toDateString() : null,
                'gender' => $child->gender,
                'address' => $child->address,
                'postcode' => $child->postcode,
                'city' => $child->city,
                'region' => $child->region,
                'approvalStatus' => $child->approval_status,
                'approvedAt' => $child->approved_at ? $child->approved_at->toIso8601String() : null,
                'approvedByName' => $approvedBy?->name,
                'rejectionReason' => $child->rejection_reason,
                'rejectedAt' => $child->rejected_at ? $child->rejected_at->toIso8601String() : null,
                'parentId' => $parent ? (string) $parent->id : null,
                'parentName' => $parent?->name,
                'parentEmail' => $parent?->email,
                'parentPhone' => $parent?->phone,
                'hasChecklist' => (bool) $checklist,
                'checklistCompleted' => (bool) optional($checklist)->checklist_completed,
                'checklistCompletedAt' => $checklist?->checklist_completed_at?->toIso8601String(),
                'createdAt' => $child->created_at ? $child->created_at->toIso8601String() : null,
                'updatedAt' => $child->updated_at ? $child->updated_at->toIso8601String() : null,
            ];

            return $this->successResponse($data, 'Checklist marked complete and child approved.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Child not found.');
        } catch (\Exception $e) {
            Log::error('Error completing admin child checklist', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to complete checklist.');
        }
    }

    /**
     * Reject a child.
     *
     * POST /api/v1/admin/children/{id}/reject
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        try {
            $child = Child::findOrFail($id);

            if ($child->approval_status === Child::STATUS_REJECTED) {
                return $this->validationErrorResponse([
                    'child' => ['Child is already rejected.'],
                ]);
            }

            $validated = $request->validate([
                'rejection_reason' => 'nullable|string|max:500',
            ]);

            $child->update([
                'approval_status' => Child::STATUS_REJECTED,
                'rejected_at' => now(),
                'rejection_reason' => $validated['rejection_reason'] ?? null,
                'approved_at' => null,
                'approved_by' => null,
            ]);

            app(\App\Contracts\Notifications\INotificationDispatcher::class)
                ->dispatch(\App\Services\Notifications\NotificationIntentFactory::childRejected(
                    $child,
                    (string) ($validated['rejection_reason'] ?? '')
                ));

            // Reload relationships
            $child->load(['user', 'approvedBy', 'checklist']);

            $parent = $child->user;
            $approvedBy = $child->approvedBy;
            $checklist = $child->checklist;

            $data = [
                'id' => (string) $child->id,
                'name' => $child->name,
                'age' => $child->age,
                'dateOfBirth' => $child->date_of_birth ? $child->date_of_birth->toDateString() : null,
                'gender' => $child->gender,
                'address' => $child->address,
                'postcode' => $child->postcode,
                'city' => $child->city,
                'region' => $child->region,
                'approvalStatus' => $child->approval_status,
                'approvedAt' => $child->approved_at ? $child->approved_at->toIso8601String() : null,
                'approvedByName' => $approvedBy?->name,
                'rejectionReason' => $child->rejection_reason,
                'rejectedAt' => $child->rejected_at ? $child->rejected_at->toIso8601String() : null,
                'parentId' => $parent ? (string) $parent->id : null,
                'parentName' => $parent?->name,
                'parentEmail' => $parent?->email,
                'parentPhone' => $parent?->phone,
                'hasChecklist' => (bool) $checklist,
                'checklistCompleted' => (bool) optional($checklist)->checklist_completed,
                'checklistCompletedAt' => $checklist?->checklist_completed_at?->toIso8601String(),
                'createdAt' => $child->created_at ? $child->created_at->toIso8601String() : null,
                'updatedAt' => $child->updated_at ? $child->updated_at->toIso8601String() : null,
            ];

            return $this->successResponse($data, 'Child rejected successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Child not found.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error rejecting admin child', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to reject child.');
        }
    }

    /**
     * Link a child to a different parent.
     *
     * POST /api/v1/admin/children/{id}/link-parent
     */
    public function linkParent(Request $request, string $id): JsonResponse
    {
        try {
            $child = Child::findOrFail($id);

            $validated = $request->validate([
                'parent_id' => 'required|exists:users,id',
            ]);

            $child->update([
                'user_id' => $validated['parent_id'],
            ]);

            // Reload relationships
            $child->load(['user', 'approvedBy']);

            $parent = $child->user;
            $approvedBy = $child->approvedBy;

            $data = [
                'id' => (string) $child->id,
                'name' => $child->name,
                'age' => $child->age,
                'dateOfBirth' => $child->date_of_birth ? $child->date_of_birth->toDateString() : null,
                'gender' => $child->gender,
                'address' => $child->address,
                'postcode' => $child->postcode,
                'city' => $child->city,
                'region' => $child->region,
                'approvalStatus' => $child->approval_status,
                'approvedAt' => $child->approved_at ? $child->approved_at->toIso8601String() : null,
                'approvedByName' => $approvedBy?->name,
                'rejectionReason' => $child->rejection_reason,
                'rejectedAt' => $child->rejected_at ? $child->rejected_at->toIso8601String() : null,
                'parentId' => $parent ? (string) $parent->id : null,
                'parentName' => $parent?->name,
                'parentEmail' => $parent?->email,
                'parentPhone' => $parent?->phone,
                'createdAt' => $child->created_at ? $child->created_at->toIso8601String() : null,
                'updatedAt' => $child->updated_at ? $child->updated_at->toIso8601String() : null,
            ];

            return $this->successResponse($data, 'Child linked to parent successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Child not found.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error linking child to parent', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to link child to parent.');
        }
    }

    /**
     * Notify a parent to complete or update their child's checklist.
     *
     * POST /api/v1/admin/children/{id}/notify-parent
     */
    public function notifyParentToCompleteChecklist(string $id): JsonResponse
    {
        try {
            $child = Child::with(['user', 'checklist'])->findOrFail($id);
            $parent = $child->user;

            if (!$parent instanceof User) {
                return $this->validationErrorResponse([
                    'parent' => ['This child is not linked to a parent account.'],
                ]);
            }

            // Create a lightweight "reminder" notification email to the parent
            try {
                $checklist = $child->checklist ?? new ChildChecklist([
                    'child_id' => $child->id,
                ]);

                $parent->notify(
                    new \App\Notifications\ChildChecklistReminderNotification(
                        $child,
                        $checklist
                    )
                );
            } catch (\Throwable $e) {
                Log::error('Failed to send child checklist reminder notification', [
                    'child_id' => $child->id,
                    'parent_id' => $parent->id,
                    'error' => $e->getMessage(),
                ]);

                return $this->serverErrorResponse('Failed to send reminder. Please try again later.');
            }

            return $this->successResponse(null, 'Parent notified to complete checklist.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Child not found.');
        } catch (\Exception $e) {
            Log::error('Error notifying parent to complete checklist', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to notify parent.');
        }
    }
}

