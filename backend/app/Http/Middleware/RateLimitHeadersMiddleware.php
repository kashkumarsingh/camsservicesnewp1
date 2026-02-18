<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Symfony\Component\HttpFoundation\Response;

/**
 * RateLimitHeadersMiddleware
 * 
 * FAANG-level rate limiting headers
 * Adds standard rate limit headers to all API responses:
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Remaining requests in window
 * - X-RateLimit-Reset: Unix timestamp when limit resets
 * 
 * Works with Laravel's throttle middleware
 */
class RateLimitHeadersMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Only add headers for API routes
        if (!$request->is('api/*')) {
            return $response;
        }
        
        // Get rate limit info from throttle middleware
        // Laravel's throttle middleware stores this in response headers
        $limit = $response->headers->get('X-RateLimit-Limit');
        $remaining = $response->headers->get('X-RateLimit-Remaining');
        $reset = $response->headers->get('X-RateLimit-Reset');
        
        // If throttle middleware didn't set headers, set defaults based on route
        if (!$limit) {
            $limit = $this->getDefaultLimit($request);
            $remaining = $limit; // Assume full limit if not throttled
            $reset = now()->addMinute()->timestamp;
        }
        
        // Ensure headers are set
        $response->headers->set('X-RateLimit-Limit', $limit);
        $response->headers->set('X-RateLimit-Remaining', $remaining ?? $limit);
        $response->headers->set('X-RateLimit-Reset', $reset ?? now()->addMinute()->timestamp);
        
        return $response;
    }
    
    /**
     * Get default rate limit based on endpoint type
     */
    private function getDefaultLimit(Request $request): int
    {
        $path = $request->path();
        
        // Authentication endpoints
        if (str_contains($path, 'auth') || str_contains($path, 'login') || str_contains($path, 'register')) {
            return 5;
        }
        
        // Write endpoints (POST/PUT/DELETE)
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return 30;
        }
        
        // Search endpoints
        if (str_contains($path, 'search')) {
            return 20;
        }
        
        // Authenticated endpoints (if user is authenticated)
        if ($request->user()) {
            return 60;
        }
        
        // Public GET endpoints (default)
        return 100;
    }
}

