<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Require Approval Middleware
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Ensures user and children are approved before creating/modifying bookings
 * Location: backend/app/Http/Middleware/RequireApproval.php
 * 
 * Note: Allows viewing existing bookings (GET) for pending users,
 * but blocks creating/modifying bookings (POST/PUT/DELETE) until approved
 */
class RequireApproval
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required. Please login to continue.',
                'errors' => [
                    'authentication' => ['You must be logged in to access this resource.']
                ]
            ], 401);
        }
        
        // Allow GET requests (viewing) for pending users - they should see their existing bookings
        // Only block POST/PUT/DELETE (creating/modifying) for pending users
        $isReadOnly = in_array($request->method(), ['GET', 'HEAD', 'OPTIONS']);
        
        if (!$isReadOnly && $user->approval_status !== 'approved') {
            $statusMessage = match($user->approval_status) {
                'pending' => 'Your account is pending admin approval. You cannot book packages yet.',
                'rejected' => 'Your account was not approved. Please contact us for more information.',
                default => 'Your account is not approved for booking packages.',
            };

            return response()->json([
                'success' => false,
                'message' => $statusMessage,
                'errors' => [
                    'approval_status' => [$statusMessage]
                ]
            ], 403);
        }
        
        // For write operations (POST/PUT/DELETE), check if user has at least one approved child
        if (!$isReadOnly) {
            $approvedChildren = $user->approvedChildren()->count();
            
            if ($approvedChildren === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'You need at least one approved child to book packages.',
                    'errors' => [
                        'children' => ['No approved children found. Please add children and wait for admin approval.']
                    ]
                ], 403);
            }
        }
        
        return $next($request);
    }
}
