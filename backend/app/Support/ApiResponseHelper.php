<?php

namespace App\Support;

use App\Http\Controllers\Api\ErrorCodes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Central API response builder for the Laravel API layer.
 *
 * Single place that builds JSON responses (envelope + camelCase). Used by
 * BaseApiController, middleware, exception handler, and form requests.
 * See API_RESPONSE_CONTRACT.md. Do not use response()->json() elsewhere in the API layer.
 */
final class ApiResponseHelper
{
    /**
     * Recursively convert array keys to camelCase.
     */
    public static function keysToCamelCase(mixed $data): mixed
    {
        if ($data instanceof \Illuminate\Contracts\Support\Arrayable) {
            $data = $data->toArray();
        }
        if (! is_array($data)) {
            return $data;
        }
        $result = [];
        foreach ($data as $k => $v) {
            $key = is_string($k) ? Str::camel($k) : $k;
            $result[$key] = self::keysToCamelCase($v);
        }

        return $result;
    }

    private static function getRequestId(?Request $request): string
    {
        if ($request && $request->header('X-Request-ID')) {
            return $request->header('X-Request-ID');
        }

        return (string) Str::uuid();
    }

    /**
     * Standard success response (envelope: success, data, meta).
     */
    public static function successResponse(
        mixed $data,
        ?string $message = null,
        array $meta = [],
        int $statusCode = 200,
        ?Request $request = null
    ): JsonResponse {
        $requestId = self::getRequestId($request);
        $response = [
            'success' => true,
            'data' => self::keysToCamelCase($data),
        ];
        if ($message) {
            $response['message'] = $message;
        }
        $response['meta'] = self::keysToCamelCase(array_merge([
            'timestamp' => now()->toIso8601String(),
            'version' => 'v1',
            'requestId' => $requestId,
        ], $meta));

        return response()->json($response, $statusCode)
            ->header('X-Request-ID', $requestId)
            ->header('API-Version', 'v1');
    }

    /**
     * Standard error response (envelope: success false, message, errors?, meta).
     *
     * @param array $extraMeta Optional extra keys merged into meta (e.g. exception details in debug).
     */
    public static function errorResponse(
        string $message,
        int $statusCode = 400,
        ?string $errorCode = null,
        array $errors = [],
        ?Request $request = null,
        array $extraMeta = []
    ): JsonResponse {
        $requestId = self::getRequestId($request);
        $response = [
            'success' => false,
            'message' => $message,
        ];
        if ($errors !== []) {
            $response['errors'] = self::keysToCamelCase($errors);
        }
        $meta = array_merge([
            'timestamp' => now()->toIso8601String(),
            'version' => 'v1',
            'requestId' => $requestId,
        ], $extraMeta);
        if ($errorCode) {
            $meta['errorCode'] = $errorCode;
        }
        $response['meta'] = $meta;

        return response()->json($response, $statusCode)
            ->header('X-Request-ID', $requestId)
            ->header('API-Version', 'v1');
    }

    public static function unauthorizedResponse(?string $message = null, ?Request $request = null): JsonResponse
    {
        return self::errorResponse(
            $message ?? 'Unauthorized. Please provide a valid access token.',
            401,
            ErrorCodes::UNAUTHORIZED,
            [],
            $request
        );
    }

    public static function forbiddenResponse(?string $message = null, ?Request $request = null): JsonResponse
    {
        return self::errorResponse(
            $message ?? "Forbidden. You don't have permission to access this resource.",
            403,
            ErrorCodes::FORBIDDEN,
            [],
            $request
        );
    }

    public static function validationErrorResponse(
        array $errors,
        ?string $message = null,
        ?Request $request = null
    ): JsonResponse {
        return self::errorResponse(
            $message ?? 'Validation failed',
            422,
            ErrorCodes::VALIDATION_ERROR,
            $errors,
            $request
        );
    }

    public static function notFoundResponse(string $resource = 'Resource', ?Request $request = null): JsonResponse
    {
        return self::errorResponse(
            "{$resource} not found",
            404,
            ErrorCodes::RESOURCE_NOT_FOUND,
            [],
            $request
        );
    }

    public static function serverErrorResponse(
        ?string $message = null,
        ?string $errorCode = null,
        ?Request $request = null
    ): JsonResponse {
        return self::errorResponse(
            $message ?? 'An unexpected error occurred. Please try again later.',
            500,
            $errorCode ?? ErrorCodes::INTERNAL_SERVER_ERROR,
            [],
            $request
        );
    }

    /**
     * Empty response (e.g. 204 No Content).
     */
    public static function emptyResponse(int $statusCode = 204, ?Request $request = null): JsonResponse
    {
        $requestId = self::getRequestId($request);

        return response()->json([], $statusCode)
            ->header('X-Request-ID', $requestId)
            ->header('API-Version', 'v1');
    }

    /**
     * Paginated response (success, data, meta with pagination).
     */
    public static function paginatedResponse(
        LengthAwarePaginator $paginator,
        ?string $message = null,
        array $additionalMeta = [],
        ?Request $request = null
    ): JsonResponse {
        $requestId = self::getRequestId($request);
        $response = [
            'success' => true,
            'data' => self::keysToCamelCase($paginator->getCollection()->toArray()),
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
     * Collection response (non-paginated list).
     */
    public static function collectionResponse(
        Collection|array $collection,
        ?string $message = null,
        array $additionalMeta = [],
        ?Request $request = null
    ): JsonResponse {
        $requestId = self::getRequestId($request);
        $rawData = $collection instanceof Collection ? $collection->values()->all() : $collection;
        $count = $collection instanceof Collection ? $collection->count() : count($collection);
        $response = [
            'success' => true,
            'data' => self::keysToCamelCase($rawData),
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
}
