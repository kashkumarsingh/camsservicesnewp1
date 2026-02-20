<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Support\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * BaseApiController Trait
 *
 * FAANG-level API response standardization.
 * - Single contract: all response payload keys are camelCase (centralized here).
 * - Controllers may pass snake_case arrays (e.g. from Eloquent); output is normalized.
 * - Never return response()->json() directly; use successResponse, collectionResponse,
 *   paginatedResponse, errorResponse, etc. See API_RESPONSE_CONTRACT.md (repo root).
 */
trait BaseApiController
{
    /**
     * Recursively convert array keys to camelCase. Single place for API key convention.
     *
     * @param  mixed  $data  Array, Arrayable, or scalar
     * @return mixed
     */
    protected function keysToCamelCase(mixed $data): mixed
    {
        return ApiResponseHelper::keysToCamelCase($data);
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
        return ApiResponseHelper::successResponse($data, $message, $meta, $statusCode, request());
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
        return ApiResponseHelper::errorResponse($message, $statusCode, $errorCode, $errors, request());
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
        return ApiResponseHelper::paginatedResponse($paginator, $message, $additionalMeta, request());
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
        return ApiResponseHelper::emptyResponse($statusCode, request());
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
        return ApiResponseHelper::collectionResponse($collection, $message, $additionalMeta, request());
    }

    /**
     * Standard not found response
     *
     * @param string $resource Resource name (e.g., "Package", "Booking")
     * @return JsonResponse
     */
    protected function notFoundResponse(string $resource = 'Resource'): JsonResponse
    {
        return ApiResponseHelper::notFoundResponse($resource, request());
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
        return ApiResponseHelper::validationErrorResponse($errors, $message, request());
    }

    /**
     * Standard unauthorized response
     *
     * @param string|null $message Custom error message
     * @return JsonResponse
     */
    protected function unauthorizedResponse(?string $message = null): JsonResponse
    {
        return ApiResponseHelper::unauthorizedResponse($message, request());
    }

    /**
     * Standard forbidden response
     *
     * @param string|null $message Custom error message
     * @return JsonResponse
     */
    protected function forbiddenResponse(?string $message = null): JsonResponse
    {
        return ApiResponseHelper::forbiddenResponse($message, request());
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
        return ApiResponseHelper::serverErrorResponse($message, $errorCode, request());
    }
}

