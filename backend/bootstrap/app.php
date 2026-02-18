<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

/** Add CORS headers to an API response so the browser allows the frontend to read it (e.g. 401). */
if (!function_exists('apiJsonResponseWithCors')) {
    function apiJsonResponseWithCors(Request $request, array $data, int $status = 200): Response
    {
        $response = response()->json($data, $status);
        $origin = $request->header('Origin');
        if (!$origin) {
            return $response;
        }
        $allowed = config('cors.allowed_origins', []);
        $patterns = config('cors.allowed_origins_patterns', []);
        $defaultOrigins = ['http://localhost:4300', 'http://localhost:3000', 'http://127.0.0.1:4300', 'http://127.0.0.1:3000'];
        $allowed = array_filter(array_merge($allowed ?: [], $defaultOrigins));
        $allowOrigin = in_array($origin, $allowed, true) ? $origin : null;
        if (!$allowOrigin && !empty($patterns)) {
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $origin)) {
                    $allowOrigin = $origin;
                    break;
                }
            }
        }
        if ($allowOrigin) {
            $response->header('Access-Control-Allow-Origin', $allowOrigin);
            $response->header('Access-Control-Allow-Credentials', 'true');
        }
        return $response;
    }
}

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders([
        \App\Providers\AppServiceProvider::class,
        \App\Providers\EventServiceProvider::class,
    ])
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Register API cache and role-based middleware
        $middleware->alias([
            'api.cache' => \App\Http\Middleware\ApiCacheMiddleware::class,
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'require.approval' => \App\Http\Middleware\RequireApproval::class,
            'trainer' => \App\Http\Middleware\EnsureUserIsTrainer::class,
            'content-admin' => \App\Http\Middleware\EnsureUserCanManageContent::class,
        ]);
        
        // Trust proxies for HTTPS detection behind Render.com/load balancers
        // This ensures request()->secure() works correctly
        $middleware->trustProxies(at: '*');
        
        // Enable CORS for all API routes
        // CORS configuration is in config/cors.php
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\EnsureApiStateless::class,
            \App\Http\Middleware\RequestIdMiddleware::class, // Request tracking
            \App\Http\Middleware\SecurityHeadersMiddleware::class, // Security headers
            \App\Http\Middleware\RateLimitHeadersMiddleware::class, // Rate limit headers
        ]);
        
        // Exclude API routes from CSRF verification
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'sanctum/csrf-cookie',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // API routes: return JSON 401 for unauthenticated requests instead of redirecting to missing 'login' route
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return apiJsonResponseWithCors($request, ['message' => 'Unauthenticated.'], 401);
            }
        });

        // When auth middleware redirects to route('login') and login route does not exist (API-only app),
        // Laravel throws RouteNotFoundException. Return 401 JSON for api/* so clients without Accept: application/json still get JSON.
        $exceptions->render(function (RouteNotFoundException $e, Request $request) {
            if ($request->is('api/*') && str_contains($e->getMessage(), 'login')) {
                return apiJsonResponseWithCors($request, ['message' => 'Unauthenticated.'], 401);
            }
        });

        // API 500: when APP_DEBUG is true, return JSON with exception details so the cause is visible in Network tab / frontend logs
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (!$request->is('api/*') || !config('app.debug')) {
                return null;
            }
            $payload = [
                'message' => $e->getMessage(),
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ];
            return apiJsonResponseWithCors($request, $payload, 500);
        });
    })->create();


