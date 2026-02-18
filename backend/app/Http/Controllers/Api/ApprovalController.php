<?php

namespace App\Http\Controllers\Api;

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
        
        if (!in_array($admin->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Security: Only super_admins can approve super_admins
        // Admins can approve parents and trainers, but NOT super_admins
        if ($user->role === 'super_admin' && $admin->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Permission denied. Only super admins can approve super admin users.',
            ], 403);
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

        return response()->json([
            'success' => true,
            'message' => 'User approved successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'approval_status' => $user->approval_status,
                    'approved_at' => $user->approved_at->toIso8601String(),
                    'approved_by' => $admin->id,
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
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
        
        if (!in_array($admin->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Security: Only super_admins can reject super_admins
        // Admins can reject parents and trainers, but NOT super_admins
        if ($user->role === 'super_admin' && $admin->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Permission denied. Only super admins can reject super admin users.',
            ], 403);
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

        return response()->json([
            'success' => true,
            'message' => 'User rejected successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'approval_status' => $user->approval_status,
                    'rejected_at' => $user->rejected_at->toIso8601String(),
                    'rejection_reason' => $user->rejection_reason,
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
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
        
        if (!in_array($admin->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $child = Child::with('checklist')->find($childId);

        if (!$child) {
            return response()->json([
                'success' => false,
                'message' => 'Child not found',
            ], 404);
        }

        // Validate checklist exists
        if (!$child->checklist) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot approve child: Checklist has not been submitted yet. Parent must complete the checklist first.',
            ], 422);
        }

        // Validate checklist is completed
        if (!$child->checklist->checklist_completed) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot approve child: Checklist has been submitted but not yet reviewed and marked as completed. Please review the checklist first.',
            ], 422);
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

        return response()->json([
            'success' => true,
            'message' => 'Child approved successfully',
            'data' => [
                'child' => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'approval_status' => $child->approval_status,
                    'approved_at' => $child->approved_at->toIso8601String(),
                    'approved_by' => $admin->id,
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
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
        
        if (!in_array($admin->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $child = Child::find($childId);

        if (!$child) {
            return response()->json([
                'success' => false,
                'message' => 'Child not found',
            ], 404);
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

        return response()->json([
            'success' => true,
            'message' => 'Child rejected successfully',
            'data' => [
                'child' => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'approval_status' => $child->approval_status,
                    'rejected_at' => $child->rejected_at->toIso8601String(),
                    'rejection_reason' => $child->rejection_reason,
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }
}

response()->json([
            'success' => true,
            'message' => 'Child rejected successfully',
            'data' => [
                'child' => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'approval_status' => $child->approval_status,
                    'rejected_at' => $child->rejected_at->toIso8601String(),
                    'rejection_reason' => $child->rejection_reason,
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }
}

