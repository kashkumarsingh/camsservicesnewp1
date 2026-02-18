<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensure User Can Manage Content Middleware
 *
 * Clean Architecture: Interface Layer
 * Purpose: Allows admins, super_admins and editors to access content
 *          management endpoints (public pages, blog, SEO tools).
 */
class EnsureUserCanManageContent
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
                'message' => 'Authentication required',
                'errors' => [
                    'authentication' => ['You must be logged in to access this resource.'],
                ],
            ], 401);
        }

        if (!in_array($user->role, ['admin', 'super_admin', 'editor'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Content editor access required.',
                'errors' => [
                    'authorization' => ['You do not have permission to manage public content.'],
                ],
            ], 403);
        }

        return $next($request);
    }
}

