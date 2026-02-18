<?php

namespace App\Http\Controllers\Api;

use App\Actions\ContactSubmissions\CreateContactSubmissionAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactSubmissionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Contact Submission Controller (Interface Layer - API)
 * 
 * Clean Architecture: Interface Layer (API Adapter)
 * Purpose: Handles HTTP requests for contact submission API endpoints
 * Location: backend/app/Http/Controllers/Api/ContactSubmissionController.php
 * 
 * This controller:
 * - Receives HTTP requests
 * - Calls Use Cases (Actions) from Application Layer
 * - Formats API responses (JSON)
 * - Handles HTTP-specific concerns (status codes, headers)
 */
class ContactSubmissionController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly CreateContactSubmissionAction $createContactSubmissionAction
    ) {
    }

    /**
     * Store a new contact submission.
     * 
     * POST /api/v1/contact/submissions
     */
    public function store(StoreContactSubmissionRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['ip_address'] = $request->ip();
            $data['user_agent'] = $request->userAgent();
            $data['postal_code'] = $data['postal_code'] ?? $request->input('postalCode');

            $submission = $this->createContactSubmissionAction->execute($data);

            return $this->successResponse(
                $submission,
                'Thank you! We\'ve received your message and will get back to you shortly.',
                [],
                201
            );
        } catch (\RuntimeException $e) {
            // Handle duplicate submission or rate limit errors
            // These are user-facing errors with friendly messages already
            $errorCode = str_contains($e->getMessage(), 'already submitted') 
                ? \App\Http\Controllers\Api\ErrorCodes::CONFLICT 
                : \App\Http\Controllers\Api\ErrorCodes::RATE_LIMIT_EXCEEDED;
            
            return $this->errorResponse($e->getMessage(), $errorCode, [], 429);
        } catch (\Illuminate\Database\QueryException $e) {
            // Database errors - show friendly message, log technical details
            Log::error('Database error creating contact submission', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'sql' => $e->getSql() ?? 'N/A',
            ]);

            return $this->errorResponse(
                'We\'re experiencing technical difficulties. Please try again in a few moments, or contact us directly at info@camsservice.co.uk',
                \App\Http\Controllers\Api\ErrorCodes::INTERNAL_SERVER_ERROR,
                [],
                503 // Service Unavailable
            );
        } catch (\PDOException $e) {
            // Database connection errors - show friendly message
            Log::error('Database connection error creating contact submission', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);

            return $this->errorResponse(
                'We\'re experiencing technical difficulties. Please try again in a few moments, or contact us directly at info@camsservice.co.uk',
                \App\Http\Controllers\Api\ErrorCodes::INTERNAL_SERVER_ERROR,
                [],
                503 // Service Unavailable
            );
        } catch (\Exception $e) {
            // Catch-all for any other errors - show friendly message
            Log::error('Unexpected error creating contact submission', [
                'error' => $e->getMessage(),
                'type' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse(
                'Something went wrong. Please try again, or contact us directly at info@camsservice.co.uk',
                \App\Http\Controllers\Api\ErrorCodes::INTERNAL_SERVER_ERROR,
                [],
                500
            );
        }
    }
}

