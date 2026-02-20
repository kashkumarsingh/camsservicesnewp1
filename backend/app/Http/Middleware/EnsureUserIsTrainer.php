<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Api\ErrorCodes;
use App\Support\ApiResponseHelper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensure User Is Trainer Middleware
 *
 * Clean Architecture: Interface Layer
 * Purpose: Ensures user has trainer role and is approved
 * Location: backend/app/Http/Middleware/EnsureUserIsTrainer.php
 */
class EnsureUserIsTrainer
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
            return ApiResponseHelper::errorResponse(
                'Authentication required',
                401,
                ErrorCodes::UNAUTHORIZED,
                ['authentication' => ['You must be logged in to access this resource.']],
                $request
            );
        }

        if ($user->role !== 'trainer') {
            return ApiResponseHelper::errorResponse(
                'Unauthorized. Trainer access required.',
                403,
                ErrorCodes::FORBIDDEN,
                ['authorization' => ['You do not have permission to access this resource. Trainer role required.']],
                $request
            );
        }

        if ($user->approval_status !== 'approved') {
            $statusMessage = match ($user->approval_status) {
                'pending' => 'Your trainer account is pending admin approval.',
                'rejected' => 'Your trainer account was not approved. Please contact us for more information.',
                default => 'Your trainer account is not approved.',
            };

            return ApiResponseHelper::errorResponse(
                $statusMessage,
                403,
                ErrorCodes::FORBIDDEN,
                ['approvalStatus' => [$statusMessage]],
                $request
            );
        }

        return $next($request);
    }
}

