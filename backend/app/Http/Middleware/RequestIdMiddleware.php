<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * RequestIdMiddleware
 * 
 * FAANG-level request tracking
 * Generates unique request ID for each API request and includes it in:
 * - Request headers (for downstream services)
 * - Response headers (for client tracing)
 * - Logs (for distributed tracing)
 */
class RequestIdMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get existing request ID from header or generate new one
        $requestId = $request->header('X-Request-ID') ?: (string) Str::uuid();
        
        // Add request ID to request for use in controllers
        $request->headers->set('X-Request-ID', $requestId);
        
        // Add to request attributes for easy access
        $request->attributes->set('request_id', $requestId);
        
        // Process request
        $response = $next($request);
        
        // Add request ID to response headers
        $response->headers->set('X-Request-ID', $requestId);
        
        // Add request ID to log context for distributed tracing
        if (config('logging.with_request_id', true)) {
            \Log::withContext(['request_id' => $requestId]);
        }
        
        return $response;
    }
}

