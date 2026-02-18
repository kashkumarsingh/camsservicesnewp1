<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensure API routes are stateless (no session/CSRF required)
 * 
 * This middleware ensures that API routes don't use sessions,
 * preventing 419 CSRF errors for stateless API calls.
 * 
 * Best Practice: API routes should be stateless and use Bearer token
 * authentication instead of session cookies. This aligns with REST API
 * standards and Laravel's recommended approach.
 */
class EnsureApiStateless
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Store original session driver to restore after request
        $originalDriver = config('session.driver');
        
        // Disable session for API routes to prevent CSRF issues
        // This ensures API routes are truly stateless (REST API best practice)
        config(['session.driver' => 'array']);
        
        try {
            $response = $next($request);
        } finally {
            // Restore original session driver (defensive programming)
            // This ensures we don't break other parts of the application
            config(['session.driver' => $originalDriver]);
        }
        
        return $response;
    }
}

