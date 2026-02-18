<?php

namespace App\Http\Controllers\Api;

/**
 * API Error Codes
 * 
 * FAANG-level error code constants for machine-readable error identification
 * Used in API error responses for programmatic error handling
 */
class ErrorCodes
{
    // Resource Errors (4xx)
    public const RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND';
    public const VALIDATION_ERROR = 'VALIDATION_ERROR';
    public const UNAUTHORIZED = 'UNAUTHORIZED';
    public const FORBIDDEN = 'FORBIDDEN';
    public const BAD_REQUEST = 'BAD_REQUEST';
    public const CONFLICT = 'CONFLICT';
    public const UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY';
    public const RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED';
    public const PAYMENT_REQUIRED = 'PAYMENT_REQUIRED';
    
    // Server Errors (5xx)
    public const INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR';
    public const SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE';
    public const DATABASE_ERROR = 'DATABASE_ERROR';
    public const EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR';
    
    // Business Logic Errors
    public const BOOKING_ERROR = 'BOOKING_ERROR';
    public const PAYMENT_ERROR = 'PAYMENT_ERROR';
    public const INVALID_STATE = 'INVALID_STATE';
    public const BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION';
    
    // Authentication & Authorization
    public const AUTH_ERROR = 'AUTH_ERROR';
    public const AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED';
    public const TOKEN_EXPIRED = 'TOKEN_EXPIRED';
    public const TOKEN_INVALID = 'TOKEN_INVALID';
    public const INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS';
}

