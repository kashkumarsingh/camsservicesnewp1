<?php

/**
 * Frontend URL Helper
 * 
 * Clean Architecture: Infrastructure Layer (Utilities)
 * Purpose: Centralized helper functions for generating frontend URLs
 * Location: backend/app/Helpers/FrontendUrlHelper.php
 * 
 * Provides consistent frontend URL generation for redirects, emails,
 * notifications, and other backend-to-frontend references.
 */

if (!function_exists('parent_dashboard_url')) {
    /**
     * Get the parent dashboard URL
     * 
     * @return string Full URL to parent dashboard
     */
    function parent_dashboard_url(): string
    {
        $frontendUrl = config('services.frontend.url', config('app.url', 'http://localhost:4300'));
        return rtrim($frontendUrl, '/') . '/dashboard';
    }
}


if (!function_exists('trainer_dashboard_url')) {
    /**
     * Get the trainer dashboard URL
     * 
     * @return string Full URL to trainer dashboard
     */
    function trainer_dashboard_url(): string
    {
        $frontendUrl = config('services.frontend.url', config('app.url', 'http://localhost:4300'));
        return rtrim($frontendUrl, '/') . '/trainer/dashboard';
    }
}

if (!function_exists('frontend_url')) {
    /**
     * Get the base frontend URL
     * 
     * @param string|null $path Optional path to append
     * @return string Full URL to frontend (with optional path)
     */
    function frontend_url(?string $path = null): string
    {
        $frontendUrl = config('services.frontend.url', config('app.url', 'http://localhost:4300'));
        $baseUrl = rtrim($frontendUrl, '/');
        
        if ($path) {
            $path = ltrim($path, '/');
            return $baseUrl . '/' . $path;
        }
        
        return $baseUrl;
    }
}
