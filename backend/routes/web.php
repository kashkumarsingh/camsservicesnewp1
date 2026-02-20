<?php

use Illuminate\Support\Facades\Route;

// Admin is the Next.js dashboard at FRONTEND_URL/dashboard/admin
Route::get('/', function () {
    $frontend = config('services.frontend.url', 'http://localhost:4300');
    return redirect($frontend);
});

// Legacy /admin and /dashboard redirects → Next.js universal dashboard
Route::get('/admin', function () {
    return redirect(frontend_url('/dashboard/admin'));
})->name('admin.dashboard.url');

Route::get('/dashboard', function () {
    return redirect(frontend_url('/dashboard'));
})->name('dashboard.url');

/**
 * Frontend Route References (API Endpoints)
 * 
 * These routes return JSON with frontend URLs for debugging/reference.
 * For actual redirects in code, use the helper functions:
 *   - parent_dashboard_url()
 *   - trainer_dashboard_url()
 *   - frontend_url($path)
 * 
 * Clean Architecture: Infrastructure Layer (Routing)
 * Purpose: Provide API endpoints for frontend URL references
 * Location: backend/routes/web.php
 */
Route::get('/routes/parent-dashboard', function () {
    return response()->json([
        'route' => 'parent.dashboard',
        'url' => parent_dashboard_url(),
    ]);
})->name('parent.dashboard.url');

Route::get('/routes/trainer-dashboard', function () {
    return response()->json([
        'route' => 'trainer.dashboard',
        'url' => trainer_dashboard_url(),
    ]);
})->name('trainer.dashboard.url');
