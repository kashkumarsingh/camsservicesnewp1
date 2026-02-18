<?php

namespace App\Actions\Testimonials;

use App\Models\Testimonial;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * GetTestimonialAction
 *
 * Clean Architecture Layer: Application (Use Case)
 * Purpose: Retrieve a single testimonial (published by default) by slug or UUID.
 */
class GetTestimonialAction
{
    /**
     * Retrieve a testimonial by slug, public_id, or database id fallback.
     *
     * @param string $identifier
     * @param bool $includeUnpublished
     * @return Testimonial
     *
     * @throws ModelNotFoundException
     */
    public function execute(string $identifier, bool $includeUnpublished = false): Testimonial
    {
        $query = Testimonial::query();

        if (!$includeUnpublished) {
            $query->published();
        }

        return $query
            ->where('slug', $identifier)
            ->orWhere('public_id', $identifier)
            ->orWhere('id', $identifier)
            ->firstOrFail();
    }
}

