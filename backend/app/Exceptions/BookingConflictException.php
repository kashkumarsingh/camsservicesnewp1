<?php

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Thrown when a booking operation conflicts with existing state (e.g. duplicate booking,
 * child already has active package). Controller maps to 409 with standard envelope and optional context.
 */
class BookingConflictException extends HttpException
{
    /**
     * @param  array<string, mixed>  $context  Optional data for the error response (e.g. existingBooking)
     */
    public function __construct(
        string $message = 'Booking conflict',
        ?\Throwable $previous = null,
        int $code = 0,
        array $headers = [],
        private readonly array $context = []
    ) {
        parent::__construct(409, $message, $previous, $headers, $code);
    }

    /**
     * @return array<string, mixed>
     */
    public function getContext(): array
    {
        return $this->context;
    }
}
