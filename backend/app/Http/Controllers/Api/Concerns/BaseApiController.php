<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Http\Controllers\Api\ErrorCodes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * BaseApiController Trait
 * 
 * FAANG-level API response standardization
 * Provides consistent response formatting, error handling, and metadata
 * 
 * All API controllers should use this trait for consistent responses
 */
trait BaseApiController
{
    /**
     * Generate or retrieve request ID for tracing
     */
    protected function getRequestId(Request $request): string
    {
        // Check if request ID already exists (from middleware)
        $requestId = $request->header('X-Request-ID');
        
        if ($requestId) {
            return $requestId;
        }
        
        // Generate new request ID
        return (string) Str::uuid();
    }

    /**
     * Standard success response
     * 
     * @param mixed $data Response data
     * @param string|null $message Optional success message
     * @param array $meta Additional metadata
     * @param int $statusCode HTTP status code (default: 200)
     * @return JsonResponse
     */
    protected function successResponse(
        $data,
        ?string $message = null,
        array $meta = [],
        int $statusCode = 200
    ): JsonResponse {
        $request = request();
        $requestId = $this->getRequestId($request);
        
        $response = [
            'success' => true,
            'data' => $data,
        ];
        
        if ($message) {
            $response['message'] = $message;
        }
        
        $response['meta'] = array_merge([
            'timestamp' => now()->toIso8601String(),
            'version' => 'v1',
            'requestId' => $requestId,
        ], $meta);
        
        return response()->json($response, $statusCode)
            ->header('X-Request-ID', $requestId)
            ->header('API-Version', 'v1');
    }

    /**
     * Standard error response
     * 
     * @param string $message Error message
     * @param string|null $errorCode Machine-readable error code
     * @param array $errors Field-level validation errors
     * @param int $statusCode HTTP status code
     * @return JsonResponse
     */
    protected function errorResponse(
        string $message,
        ?string $errorCode = null,
        array $errors = [],
        int $statusCode = 400
    ): JsonResponse {
        $request = request();
        $requestId = $this->getRequestId($request);
        
        $response = [
            'success' => false,
            'message' => $message,
        ];
        
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        
        $response['meta'] = [
            'timestamp' => now()->toIso8601String(),
            'version' => 'v1',
            'requestId' => $requestId,
        ];
        
        if ($errorCode) {
            $response['meta']['errorCode'] = $errorCode;
        }
        
        return response()->json($response, $statusCode)
            ->header('X-Request-ID', $requestId)
            ->header('API-Version', 'v1');
    }

    /**
     * Standard paginated response
     * 
     * @param LengthAwarePaginator $paginator
     * @param string|null $message Optional success message
     * @param array $additionalMeta Additional metadata
     * @return JsonResponse
     */
    protected function paginatedResponse(
        LengthAwarePaginator $paginator,
        ?string $message = null,
        array $additionalMeta = []
    ): JsonResponse {
        $request = request();
        $requestId = $this->getRequestId($request);
        
        $response = [
            'success' => true,
            'data' => $paginator->getCollection(),
        ];
        
        if ($message) {
            $response['message'] = $message;
        }
        
        $response['meta'] = array_merge([
            'timestamp' => now()->toIso8601String(),
            'version' => 'v1',
            'requestId' => $requestId,
            'pagination' => [
                'currentPage' => $paginator->currentPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'lastPage' => $paginator->lastPage(),
                'hasMore' => $paginator->hasMorePages(),
                'prevPage' => $paginator->currentPage() > 1 ? $paginator->currentPage() - 1 : null,
                'nextPage' => $paginator->hasMorePages() ? $paginator->currentPage() + 1 : null,
            ],
        ], $additionalMeta);
        
        return response()->json($response, 200)
            ->header('X-Request-ID', $requestId)
            ->header('API-Version', 'v1');
    }

    /**
     * Standard single-item response
     *
     * @param array|object $data The item data
     * @param int $statusCode HTTP status code (default: 200)
     * @param string|null $message Optional success message
     * @return JsonResponse
     */
    protected function itemResponse($data, int $statusCode = 200, ?string $message = null): JsonResponse
    {
        return $this->successResponse($data, $message, [], $statusCode);
    }

    /**
     * Standard empty response (e.g. 204 No Content)
     *
     * @param int $statusCode HTTP status code (default: 204)
     * @return JsonResponse
     */
    protected function emptyResponse(int $statusCode = 204): JsonResponse
    {
        $request = request();
        $requestId = $this->getRequestId($request);

        return response()->json([], $statusCode)
            ->header('X-Request-ID', $requestId)
            ->header('API-Version', 'v1');
    }

    /**
     * Standard collection response (non-paginated list)
     * 
     * @param Collection|array $collection
     * @param string|null $message Optional success message
     * @param array $additionalMeta Additional metadata
     * @return JsonResponse
     */
    protected function collectionResponse(
        $collection,
        ?string $message = null,
        array $additionalMeta = []
    ): JsonResponse {
        $request = request();
        $requestId = $this->getRequestId($request);
        
        $data = $collection instanceof Collection ? $collection->values() : $collection;
        $count = $collection instanceof Collection ? $collection->count() : count($collection);
        
        $response = [
            'success' => true,
            'data' => $data,
        ];
        
        if ($message) {
            $response['message'] = $message;
        }
        
        $response['meta'] = array_merge([
            'timestamp' => now()->toIso8601String(),
            'version' => 'v1',
            'requestId' => $requestId,
            'count' => $count,
        ], $additionalMeta);
        
        return response()->json($response, 200)
            ->header('X-Request-ID', $requestId)
            ->header('API-Version', 'v1');
    }

    /**
     * Standard not found response
     * 
     * @param string $resource Resource name (e.g., "Package", "Booking")
     * @return JsonResponse
     */
    protected function notFoundResponse(string $resource = 'Resource'): JsonResponse
    {
        return $this->errorResponse(
            message: "{$resource} not found",
            errorCode: ErrorCodes::RESOURCE_NOT_FOUND,
            statusCode: 404
        );
    }

    /**
     * Standard validation error response
     * 
     * @param array $errors Validation errors (field => [messages])
     * @param string|null $message Custom error message
     * @return JsonResponse
     */
    protected function validationErrorResponse(
        array $errors,
        ?string $message = null
    ): JsonResponse {
        return $this->errorResponse(
            message: $message ?? 'Validation failed',
            errorCode: ErrorCodes::VALIDATION_ERROR,
            errors: $errors,
            statusCode: 422
        );
    }

    /**
     * Standard unauthorized response
     * 
     * @param string|null $message Custom error message
     * @return JsonResponse
     */
    protected function unauthorizedResponse(?string $message = null): JsonResponse
    {
        return $this->errorResponse(
            message: $message ?? 'Unauthorized. Please provide a valid access token.',
            errorCode: ErrorCodes::UNAUTHORIZED,
            statusCode: 401
        );
    }

    /**
     * Standard forbidden response
     * 
     * @param string|null $message Custom error message
     * @return JsonResponse
     */
    protected function forbiddenResponse(?string $message = null): JsonResponse
    {
        return $this->errorResponse(
            message: $message ?? "Forbidden. You don't have permission to access this resource.",
            errorCode: ErrorCodes::FORBIDDEN,
            statusCode: 403
        );
    }

    /**
     * Standard server error response
     * 
     * @param string|null $message Custom error message
     * @param string|null $errorCode Machine-readable error code
     * @return JsonResponse
     */
    protected function serverErrorResponse(
        ?string $message = null,
        ?string $errorCode = null
    ): JsonResponse {
        return $this->errorResponse(
            message: $message ?? 'An unexpected error occurred. Please try again later.',
            errorCode: $errorCode ?? ErrorCodes::INTERNAL_SERVER_ERROR,
            statusCode: 500
        );
    }
}

