<?php

namespace App\Services\Booking;

use App\Models\Activity;
use Illuminate\Support\Str;

/**
 * Persist Custom Activities From Notes Service (Application Layer)
 *
 * When a parent (or trainer) books a session with custom activity text in itinerary notes,
 * we parse "Custom Activity: Name (Xh)" lines and ensure corresponding Activity records exist
 * so they appear in the standard activities list for future bookings.
 */
class PersistCustomActivitiesFromNotesService
{
    private const CUSTOM_ACTIVITY_PREFIX = 'Custom Activity:';

    private const DEFAULT_CUSTOM_CATEGORY = 'custom';

    /**
     * Parse itinerary notes (string or array) and ensure each custom activity exists in activities table.
     *
     * @param string|array|null $itineraryNotes
     * @return void
     */
    public function persistFromNotes(string|array|null $itineraryNotes): void
    {
        if ($itineraryNotes === null || $itineraryNotes === '') {
            return;
        }

        $lines = is_array($itineraryNotes)
            ? $itineraryNotes
            : array_filter(array_map('trim', explode("\n", (string) $itineraryNotes)));

        foreach ($lines as $line) {
            if (! is_string($line) || ! str_starts_with($line, self::CUSTOM_ACTIVITY_PREFIX)) {
                continue;
            }

            $description = trim(substr($line, strlen(self::CUSTOM_ACTIVITY_PREFIX)));
            if ($description === '') {
                continue;
            }

            // Match "Name (1h)" or "Name (1.5h)" for duration; business rule: activity durations are whole hours only
            if (preg_match('/^(.+?)\s*\((\d+(?:\.\d+)?)\s*h\)\s*$/i', $description, $match)) {
                $name = trim($match[1]);
                $duration = max(1, (int) round((float) $match[2]));
            } else {
                $name = $description;
                $duration = 1;
            }

            if ($name === '') {
                continue;
            }

            $this->ensureActivityExists($name, $duration);
        }
    }

    /**
     * Ensure an activity with the given name exists (category = custom), create if not.
     *
     * @param  int  $duration  Duration in whole hours (business rule: no decimal hours)
     */
    private function ensureActivityExists(string $name, int $duration): void
    {
        $existing = Activity::where('category', self::DEFAULT_CUSTOM_CATEGORY)
            ->where('name', $name)
            ->first();

        if ($existing) {
            return;
        }

        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $attempt = 0;
        while (Activity::where('slug', $slug)->exists()) {
            $attempt++;
            $slug = $baseSlug . '-' . $attempt;
        }

        Activity::create([
            'name' => $name,
            'slug' => $slug,
            'category' => self::DEFAULT_CUSTOM_CATEGORY,
            'description' => null,
            'duration' => $duration,
            'is_active' => true,
        ]);
    }
}
