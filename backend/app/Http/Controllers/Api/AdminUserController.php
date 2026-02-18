<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * Admin User Controller (Interface Layer - API)
 *
 * Clean Architecture: Interface Layer (API Adapter)
 * Purpose: Provides admin-only endpoints for listing and inspecting users
 * Guards: Protected by auth:sanctum + admin middleware (see routes/api.php)
 */
class AdminUserController extends Controller
{
    use BaseApiController;

    /**
     * List users for the admin dashboard.
     *
     * GET /api/v1/admin/users
     *
     * Supported query parameters:
     * - role: filter by role (parent, trainer, admin, super_admin)
     * - approval_status: filter by approval status (pending, approved, rejected)
     * - limit: max number of records to return (default: 100, max: 200)
     * - offset: offset for pagination (default: 0)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::query();

            if ($role = $request->query('role')) {
                $query->where('role', $role);
            }

            if ($approvalStatus = $request->query('approval_status')) {
                $query->where('approval_status', $approvalStatus);
            }

            // Basic limit/offset pagination for now (full pagination can be added later)
            $limit = max(1, min($request->integer('limit', 100), 200));
            $offset = max(0, $request->integer('offset', 0));

            $totalCount = (clone $query)->count();

            $users = $query
                ->orderByDesc('created_at')
                ->skip($offset)
                ->take($limit)
                ->get();

            $formatted = $users->map(function (User $user) {
                return [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'approvalStatus' => $user->approval_status,
                    'approvedAt' => $user->approved_at ? $user->approved_at->toIso8601String() : null,
                    'rejectionReason' => $user->rejection_reason,
                    'rejectedAt' => $user->rejected_at ? $user->rejected_at->toIso8601String() : null,
                    'registrationSource' => $user->registration_source,
                    'childrenCount' => $user->children()->count(),
                    'approvedChildrenCount' => $user->approvedChildren()->count(),
                    'bookingsCount' => $user->bookings()->count(),
                    'createdAt' => $user->created_at ? $user->created_at->toIso8601String() : null,
                    'updatedAt' => $user->updated_at ? $user->updated_at->toIso8601String() : null,
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
            Log::error('Error listing admin users', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve users for admin dashboard.');
        }
    }

    /**
     * Show a single user for the admin dashboard.
     *
     * GET /api/v1/admin/users/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = User::find($id);

            if (! $user) {
                return $this->notFoundResponse('User');
            }

            $data = [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'approvalStatus' => $user->approval_status,
                'approvedAt' => $user->approved_at ? $user->approved_at->toIso8601String() : null,
                'rejectionReason' => $user->rejection_reason,
                'rejectedAt' => $user->rejected_at ? $user->rejected_at->toIso8601String() : null,
                'registrationSource' => $user->registration_source,
                'childrenCount' => $user->children()->count(),
                'approvedChildrenCount' => $user->approvedChildren()->count(),
                'bookingsCount' => $user->bookings()->count(),
                'createdAt' => $user->created_at ? $user->created_at->toIso8601String() : null,
                'updatedAt' => $user->updated_at ? $user->updated_at->toIso8601String() : null,
            ];

            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('Error retrieving admin user', [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve user for admin dashboard.');
        }
    }

    /**
     * Create a new user (admin function).
     *
     * POST /api/v1/admin/users
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:8',
                'phone' => 'nullable|string|max:50',
                'address' => 'nullable|string|max:500',
                'postcode' => 'nullable|string|max:20',
                'role' => ['required', 'string', Rule::in(['parent', 'trainer', 'admin', 'super_admin', 'editor'])],
                'approval_status' => ['nullable', 'string', Rule::in(['pending', 'approved', 'rejected'])],
                'rejection_reason' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $user = User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'password' => Hash::make($request->input('password')),
                'phone' => $request->input('phone'),
                'address' => $request->input('address'),
                'postcode' => $request->input('postcode'),
                'role' => $request->input('role'),
                'approval_status' => $request->input('approval_status', 'pending'),
                'rejection_reason' => $request->input('rejection_reason'),
            ]);

            // If approved during creation, set approved_at and approved_by
            if ($user->approval_status === 'approved' && !$user->approved_at) {
                $user->approved_at = now();
                $user->approved_by = auth()->id();
                $user->save();
            }

            // If rejected during creation, set rejected_at
            if ($user->approval_status === 'rejected' && !$user->rejected_at) {
                $user->rejected_at = now();
                $user->save();
            }

            $data = [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'approvalStatus' => $user->approval_status,
                'approvedAt' => $user->approved_at ? $user->approved_at->toIso8601String() : null,
                'rejectionReason' => $user->rejection_reason,
                'rejectedAt' => $user->rejected_at ? $user->rejected_at->toIso8601String() : null,
                'createdAt' => $user->created_at ? $user->created_at->toIso8601String() : null,
                'updatedAt' => $user->updated_at ? $user->updated_at->toIso8601String() : null,
            ];

            return $this->createdResponse($data, 'User created successfully');
        } catch (\Exception $e) {
            Log::error('Error creating user', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to create user.');
        }
    }

    /**
     * Update an existing user (admin function).
     *
     * PUT/PATCH /api/v1/admin/users/{id}
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::find($id);

            if (! $user) {
                return $this->notFoundResponse('User');
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($id)],
                'password' => 'sometimes|nullable|string|min:8',
                'phone' => 'nullable|string|max:50',
                'address' => 'nullable|string|max:500',
                'postcode' => 'nullable|string|max:20',
                'role' => ['sometimes', 'required', 'string', Rule::in(['parent', 'trainer', 'admin', 'super_admin', 'editor'])],
                'approval_status' => ['sometimes', 'string', Rule::in(['pending', 'approved', 'rejected'])],
                'rejection_reason' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            // Update basic fields
            if ($request->has('name')) {
                $user->name = $request->input('name');
            }
            if ($request->has('email')) {
                $user->email = $request->input('email');
            }
            if ($request->filled('password')) {
                $user->password = Hash::make($request->input('password'));
            }
            if ($request->has('phone')) {
                $user->phone = $request->input('phone');
            }
            if ($request->has('address')) {
                $user->address = $request->input('address');
            }
            if ($request->has('postcode')) {
                $user->postcode = $request->input('postcode');
            }
            if ($request->has('role')) {
                $user->role = $request->input('role');
            }
            if ($request->has('rejection_reason')) {
                $user->rejection_reason = $request->input('rejection_reason');
            }

            // Handle approval status changes
            if ($request->has('approval_status')) {
                $newStatus = $request->input('approval_status');
                $oldStatus = $user->approval_status;

                $user->approval_status = $newStatus;

                // Set approved_at and approved_by when transitioning to approved
                if ($newStatus === 'approved' && $oldStatus !== 'approved') {
                    $user->approved_at = now();
                    $user->approved_by = auth()->id();
                    $user->rejected_at = null;
                    $user->rejection_reason = null;
                }

                // Set rejected_at when transitioning to rejected
                if ($newStatus === 'rejected' && $oldStatus !== 'rejected') {
                    $user->rejected_at = now();
                    $user->approved_at = null;
                    $user->approved_by = null;
                }

                // Clear dates when transitioning to pending
                if ($newStatus === 'pending') {
                    $user->approved_at = null;
                    $user->approved_by = null;
                    $user->rejected_at = null;
                }
            }

            $user->save();

            $data = [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'approvalStatus' => $user->approval_status,
                'approvedAt' => $user->approved_at ? $user->approved_at->toIso8601String() : null,
                'rejectionReason' => $user->rejection_reason,
                'rejectedAt' => $user->rejected_at ? $user->rejected_at->toIso8601String() : null,
                'createdAt' => $user->created_at ? $user->created_at->toIso8601String() : null,
                'updatedAt' => $user->updated_at ? $user->updated_at->toIso8601String() : null,
            ];

            return $this->successResponse($data, 'User updated successfully');
        } catch (\Exception $e) {
            Log::error('Error updating user', [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to update user.');
        }
    }

    /**
     * Delete a user (admin function).
     *
     * DELETE /api/v1/admin/users/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $user = User::find($id);

            if (! $user) {
                return $this->notFoundResponse('User');
            }

            // Prevent self-deletion
            if ((int) auth()->id() === (int) $id) {
                return $this->errorResponse('You cannot delete your own account.', 403);
            }

            // Soft delete if the model uses SoftDeletes, otherwise hard delete
            $user->delete();

            return $this->successResponse(null, 'User deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting user', [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to delete user.');
        }
    }

    /**
     * Approve a user (admin function).
     *
     * POST /api/v1/admin/users/{id}/approve
     *
     * @param int $id
     * @return JsonResponse
     */
    public function approve(int $id): JsonResponse
    {
        try {
            $user = User::find($id);

            if (! $user) {
                return $this->notFoundResponse('User');
            }

            $user->approval_status = 'approved';
            $user->approved_at = now();
            $user->approved_by = auth()->id();
            $user->rejected_at = null;
            $user->rejection_reason = null;
            $user->save();

            $data = [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'approvalStatus' => $user->approval_status,
                'approvedAt' => $user->approved_at ? $user->approved_at->toIso8601String() : null,
            ];

            return $this->successResponse($data, 'User approved successfully');
        } catch (\Exception $e) {
            Log::error('Error approving user', [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to approve user.');
        }
    }

    /**
     * Reject a user (admin function).
     *
     * POST /api/v1/admin/users/{id}/reject
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::find($id);

            if (! $user) {
                return $this->notFoundResponse('User');
            }

            $validator = Validator::make($request->all(), [
                'reason' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $user->approval_status = 'rejected';
            $user->rejected_at = now();
            $user->rejection_reason = $request->input('reason');
            $user->approved_at = null;
            $user->approved_by = null;
            $user->save();

            $data = [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'approvalStatus' => $user->approval_status,
                'rejectionReason' => $user->rejection_reason,
                'rejectedAt' => $user->rejected_at ? $user->rejected_at->toIso8601String() : null,
            ];

            return $this->successResponse($data, 'User rejected successfully');
        } catch (\Exception $e) {
            Log::error('Error rejecting user', [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to reject user.');
        }
    }
}

