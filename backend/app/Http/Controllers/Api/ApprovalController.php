<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Api\ErrorCodes;
use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Approval Controller (Interface Layer)
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Handles admin approval/rejection actions
 * Location: backend/app/Http/Controllers/Api/ApprovalController.php
 * 
 * Admin only - requires 'admin' or 'super_admin' role
 */
class ApprovalController extends Controller
{
    use BaseApiController;
    /**
     * Approve a user
     * 
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function approveUser(Request $request, int $userId): JsonResponse
    {
        $admin = $request->user();
        
        if (! in_array($admin->role, ['admin', 'super_admin'])) {
            return $this->forbiddenResponse('Unauthorized. Admin access required.');
        }

        $user = User::find($userId);

        if (! $user) {
            return $this->notFoundResponse('User');
        }

        // Security: Only super_admins can approve super_admins
        // Admins can approve parents and trainers, but NOT super_admins
        if ($user->role === 'super_admin' && $admin->role !== 'super_admin') {
            return $this->forbiddenResponse('Permission denied. Only super admins can approve super admin users.');
        }

        $user->update([
            'approval_status' => User::STATUS_APPROVED,
            'approved_at' => now(),
            'approved_by' => $admin->id,
            'rejection_reason' => null,
            'rejected_at' => null,
        ]);

        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::userApproved($user));

        return $this->successResponse(
            [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'approval_status' => $user->approval_status,
                    'approved_at' => $user->approved_at->toIso8601String(),
                    'approved_by' => $admin->id,
                ],
            ],
            'User approved successfully'
        );
    }

    /**
     * Reject a user
     * 
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function rejectUser(Request $request, int $userId): JsonResponse
    {
        $admin = $request->user();
        
        if (! in_array($admin->role, ['admin', 'super_admin'])) {
            return $this->forbiddenResponse('Unauthorized. Admin access required.');
        }

        $validator = Validator::make($request->all(), [
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        $user = User::find($userId);

        if (! $user) {
            return $this->notFoundResponse('User');
        }

        // Security: Only super_admins can reject super_admins
        // Admins can reject parents and trainers, but NOT super_admins
        if ($user->role === 'super_admin' && $admin->role !== 'super_admin') {
            return $this->forbiddenResponse('Permission denied. Only super admins can reject super admin users.');
        }

        $rejectionReason = $request->rejection_reason;
        
        $user->update([
            'approval_status' => User::STATUS_REJECTED,
            'rejected_at' => now(),
            'rejection_reason' => $rejectionReason,
            'approved_at' => null,
            'approved_by' => null,
        ]);

        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::userRejected($user, $rejectionReason));

        return $this->successResponse(
            [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'approval_status' => $user->approval_status,
                    'rejected_at' => $user->rejected_at->toIso8601String(),
                    'rejection_reason' => $user->rejection_reason,
                ],
            ],
            'User rejected successfully'
        );
    }

    /**
     * Approve a child
     * 
     * @param Request $request
     * @param int $childId
     * @return JsonResponse
     */
    public function approveChild(Request $request, int $childId): JsonResponse
    {
        $admin = $request->user();
        
        if (! in_array($admin->role, ['admin', 'super_admin'])) {
            return $this->forbiddenResponse('Unauthorized. Admin access required.');
        }

        $child = Child::with('checklist')->find($childId);

        if (! $child) {
            return $this->notFoundResponse('Child');
        }

        // Validate checklist exists
        if (! $child->checklist) {
            return $this->errorResponse(
                'Cannot approve child: Checklist has not been submitted yet. Parent must complete the checklist first.',
                ErrorCodes::VALIDATION_ERROR,
                [],
                422
            );
        }

        // Validate checklist is completed
        if (! $child->checklist->checklist_completed) {
            return $this->errorResponse(
                'Cannot approve child: Checklist has been submitted but not yet reviewed and marked as completed. Please review the checklist first.',
                ErrorCodes::VALIDATION_ERROR,
                [],
                422
            );
        }

        $child->update([
            'approval_status' => Child::STATUS_APPROVED,
            'approved_at' => now(),
            'approved_by' => $admin->id,
            'rejection_reason' => null,
            'rejected_at' => null,
        ]);

        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::childApproved($child));

        return $this->successResponse(
            [
                'child' => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'approval_status' => $child->approval_status,
                    'approved_at' => $child->approved_at->toIso8601String(),
                    'approved_by' => $admin->id,
                ],
            ],
            'Child approved successfully'
        );
    }

    /**
     * Reject a child
     * 
     * @param Request $request
     * @param int $childId
     * @return JsonResponse
     */
    public function rejectChild(Request $request, int $childId): JsonResponse
    {
        $admin = $request->user();
        
        if (! in_array($admin->role, ['admin', 'super_admin'])) {
            return $this->forbiddenResponse('Unauthorized. Admin access required.');
        }

        $validator = Validator::make($request->all(), [
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        $child = Child::find($childId);

        if (! $child) {
            return $this->notFoundResponse('Child');
        }

        $rejectionReason = $request->rejection_reason;

        $child->update([
            'approval_status' => Child::STATUS_REJECTED,
            'rejected_at' => now(),
            'rejection_reason' => $rejectionReason,
            'approved_at' => null,
            'approved_by' => null,
        ]);

        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::childRejected($child, $rejectionReason));

        return $this->successResponse(
            [
                'child' => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'approval_status' => $child->approval_status,
                    'rejected_at' => $child->rejected_at->toIso8601String(),
                    'rejection_reason' => $child->rejection_reason,
                ],
            ],
            'Child rejected successfully'
        );
    }
}
