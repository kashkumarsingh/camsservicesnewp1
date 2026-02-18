<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * API Cache Middleware
 * 
 * Implements HTTP cache headers (ETag, Cache-Control) for API responses.
 * Follows FAANG-level best practices:
 * - ETag for conditional requests (304 Not Modified)
 * - Cache-Control headers for browser/CDN caching
 * - Only enabled in production or when explicitly configured
 */
class ApiCacheMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, int $maxAge = 300): Response
    {
        $response = $next($request);

        // Only add cache headers for successful GET requests
        if ($request->isMethod('GET') && $response->getStatusCode() === 200) {
            // Generate ETag from response content
            $etag = md5($response->getContent());
            
            // Set ETag header
            $response->setEtag($etag);
            
            // Check if client has matching ETag (304 Not Modified)
            // This saves bandwidth by returning 304 instead of full response
            if ($response->isNotModified($request)) {
                return $response;
            }
            
            // Set Cache-Control header
            // public: Can be cached by CDN/browser/proxy
            // max-age: Cache duration in seconds
            // must-revalidate: Must revalidate when expired (prevents stale data)
            $response->headers->set('Cache-Control', sprintf(
                'public, max-age=%d, must-revalidate',
                $maxAge
            ));
            
            // Set Last-Modified header for additional cache validation
            $response->setLastModified(now());
        }

        return $response;
    }
}

