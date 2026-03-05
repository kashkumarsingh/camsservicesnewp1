<?php

namespace App\Casts;

use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * Cast that returns null for null, empty, or invalid date values.
 * Prevents 500s when the database contains 0000-00-00 or malformed dates.
 */
class NullableSafeDateCast implements CastsAttributes
{
    /**
     * @param  array<string, mixed>  $attributes
     * @return \DateTimeInterface|null
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?\DateTimeInterface
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            $parsed = Carbon::parse($value);

            return $parsed->isValid() ? $parsed : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        $dateOnly = $key === 'effective_date';
        $format = $dateOnly ? 'Y-m-d' : 'Y-m-d H:i:s';

        if ($value instanceof \DateTimeInterface) {
            return $value->format($format);
        }

        try {
            $parsed = Carbon::parse($value);

            return $parsed->isValid() ? $parsed->format($format) : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
