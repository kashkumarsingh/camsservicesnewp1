<?php

declare(strict_types=1);

namespace App\Actions\FAQs;

use App\Models\FAQ;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Get FAQ Action
 * 
 * Clean Architecture Layer: Application (Use Case)
 * 
 * Fetches a single FAQ by slug and optionally increments view count.
 */
class GetFAQAction
{
    /**
     * Execute the action.
     *
     * @param string $slug
     * @param bool $incrementViews
     * @return FAQ
     * @throws ModelNotFoundException
     */
    public function execute(string $slug, bool $incrementViews = false): FAQ
    {
        $faq = FAQ::where('slug', $slug)
            ->published()
            ->firstOrFail();

        if ($incrementViews) {
            $faq->incrementViews();
        }

        return $faq;
    }
}

