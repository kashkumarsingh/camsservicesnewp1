<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Api\ErrorCodes;
use App\Support\ApiResponseHelper;
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

        if (! $user) {
            return apiResponseWithCors($request, ApiResponseHelper::errorResponse(
                'Authentication required. Please login to continue.',
                401,
                ErrorCodes::UNAUTHORIZED,
                ['authentication' => ['You must be logged in to access this resource.']],
                $request
            ));
        }

        // Allow GET requests (viewing) for pending users - they should see their existing bookings
        // Only block POST/PUT/DELETE (creating/modifying) for pending users
        $isReadOnly = in_array($request->method(), ['GET', 'HEAD', 'OPTIONS']);

        if (! $isReadOnly && $user->approval_status !== 'approved') {
            $statusMessage = match ($user->approval_status) {
                'pending' => 'Your account is pending admin approval. You cannot book packages yet.',
                'rejected' => 'Your account was not approved. Please contact us for more information.',
                default => 'Your account is not approved for booking packages.',
            };

            return apiResponseWithCors($request, ApiResponseHelper::errorResponse(
                $statusMessage,
                403,
                ErrorCodes::FORBIDDEN,
                ['approvalStatus' => [$statusMessage]],
                $request
            ));
        }

        // For write operations (POST/PUT/DELETE), check if user has at least one approved child
        if (! $isReadOnly) {
            $approvedChildren = $user->approvedChildren()->count();

            if ($approvedChildren === 0) {
                return apiResponseWithCors($request, ApiResponseHelper::errorResponse(
                    'You need at least one approved child to book packages.',
                    403,
                    ErrorCodes::FORBIDDEN,
                    ['children' => ['No approved children found. Please add children and wait for admin approval.']],
                    $request
                ));
            }
        }

        return $next($request);
    }
}
