<?php

use App\Http\Controllers\Api\ErrorCodes;
use App\Support\ApiResponseHelper;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

/** Add CORS headers to an existing JsonResponse for API routes. */
if (! function_exists('apiResponseWithCors')) {
    function apiResponseWithCors(Request $request, JsonResponse $response): Response
    {
        $origin = $request->header('Origin');
        if (! $origin) {
            return $response;
        }
        $allowed = config('cors.allowed_origins', []);
        $patterns = config('cors.allowed_origins_patterns', []);
        $defaultOrigins = ['http://localhost:4300', 'http://localhost:3000', 'http://127.0.0.1:4300', 'http://127.0.0.1:3000'];
        $allowed = array_filter(array_merge($allowed ?: [], $defaultOrigins));
        $allowOrigin = in_array($origin, $allowed, true) ? $origin : null;
        if (! $allowOrigin && ! empty($patterns)) {
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
        
        // Trust proxies for HTTPS detection behind Railway/load balancers
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
        // API routes: return standard envelope (success, message, meta) for unauthenticated
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                $message = $e->getMessage() ?: 'Unauthenticated.';
                return apiResponseWithCors($request, ApiResponseHelper::unauthorizedResponse($message, $request));
            }
        });

        // When auth middleware redirects to route('login') and login route does not exist (API-only app),
        // Laravel throws RouteNotFoundException. Return 401 with standard envelope.
        $exceptions->render(function (RouteNotFoundException $e, Request $request) {
            if ($request->is('api/*') && str_contains($e->getMessage(), 'login')) {
                return apiResponseWithCors($request, ApiResponseHelper::unauthorizedResponse('Unauthenticated.', $request));
            }
        });

        // API HttpException (4xx/5xx from actions or kernel): standard envelope
        $exceptions->render(function (HttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return apiResponseWithCors($request, ApiResponseHelper::errorResponse(
                    $e->getMessage() ?: 'Request failed.',
                    $e->getStatusCode(),
                    null,
                    [],
                    $request
                ));
            }
        });

        // API 500: standard envelope; in debug add exception/file/line to meta
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }
            // HttpException already handled above
            if ($e instanceof HttpException) {
                return null;
            }
            $extraMeta = config('app.debug') ? [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ] : [];

            return apiResponseWithCors($request, ApiResponseHelper::errorResponse(
                $e->getMessage() ?: 'An unexpected error occurred.',
                500,
                ErrorCodes::INTERNAL_SERVER_ERROR,
                [],
                $request,
                $extraMeta
            ));
        });
    })->create();


