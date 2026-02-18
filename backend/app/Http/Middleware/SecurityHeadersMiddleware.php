<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * SecurityHeadersMiddleware
 * 
 * FAANG-level security headers
 * Adds required security headers to all API responses:
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY
 * - X-XSS-Protection: 1; mode=block
 * - Strict-Transport-Security: HSTS (HTTPS only)
 * - Content-Security-Policy: Restrict resource loading
 * 
 * Follows OWASP security best practices
 */
class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Only add security headers for API routes
        if (!$request->is('api/*')) {
            return $response;
        }
        
        // Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        
        // Prevent clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');
        
        // Enable XSS protection
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        
        // HSTS (only for HTTPS)
        if ($request->secure() || config('app.env') === 'production') {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }
        
        // Content Security Policy (restrictive for API)
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'none'; style-src 'none'; img-src 'self' data:; font-src 'self'; connect-src 'self';"
        );
        
        // Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Permissions Policy (restrictive for API)
        $response->headers->set(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=()'
        );
        
        return $response;
    }
}

