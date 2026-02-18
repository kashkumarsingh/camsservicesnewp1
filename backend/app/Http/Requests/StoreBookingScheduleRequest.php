<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Store Booking Schedule Request
 * 
 * Clean Architecture: Interface Layer (Validation)
 * Purpose: Validates booking schedule creation requests
 */
class StoreBookingScheduleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled in controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // booking_id comes from route parameter, not request body
        // It's validated in the controller by checking if booking exists
        return [
            // 'booking_id' => removed - comes from route parameter, validated in controller
            'date' => [
                'required',
                'date',
                'after:today', // No same-day bookings - must be tomorrow or later
                function ($attribute, $value, $fail) {
                    // Basic 24-hour advance booking check (detailed validation in action layer)
                    $now = \Carbon\Carbon::now();
                    $today = $now->copy()->startOfDay();
                    $sessionDate = \Carbon\Carbon::parse($value)->startOfDay();
                    $tomorrow = $today->copy()->addDay();

                    // Business Rule: No same-day bookings
                    if ($sessionDate->isSameDay($today)) {
                        $fail(str_replace(':date', $tomorrow->format('l, F j, Y'), config('booking.messages.same_day')));
                        return;
                    }

                    // Business Rule: Booking for exactly tomorrow is only allowed until 6:00 PM today
                    if ($sessionDate->isSameDay($tomorrow)) {
                        $cutoffToday = $today->copy()->setTime(18, 0, 0);
                        if ($now->gte($cutoffToday)) {
                            $dayAfterTomorrow = $tomorrow->copy()->addDay();
                            $fail(str_replace(':date', $dayAfterTomorrow->format('l, F j, Y'), config('booking.messages.tomorrow_after_cutoff')));
                            return;
                        }
                    }

                    // For tomorrow onwards: Check if start time is at least 24 hours away
                    $startTime = $this->input('start_time');
                    if ($value && $startTime) {
                        $sessionDateTime = \Carbon\Carbon::parse("{$value} {$startTime}");
                        $minimumDateTime = \Carbon\Carbon::now()->addHours(24);

                        if ($sessionDateTime->isBefore($minimumDateTime)) {
                            $formattedMinimum = $minimumDateTime->format('l, F j, Y \a\t g:i A');
                            $fail(str_replace(':time', $formattedMinimum, config('booking.messages.time_too_soon')));
                        }
                    }
                },
            ],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => [
                'required',
                'date_format:H:i',
                function ($attribute, $value, $fail) {
                    $startTime = $this->input('start_time');
                    if ($startTime && $value) {
                        $start = strtotime($startTime);
                        $end = strtotime($value);
                        // Same time = zero duration (invalid)
                        if ($end === $start) {
                            $fail('End time must be after start time.');
                            return;
                        }
                        // end < start when compared as same-day times means session spans midnight (e.g. 22:00–01:00 next day) — allow
                        // end > start means same-day session — allow
                    }
                },
            ],
            'trainer_id' => ['nullable', 'integer', 'exists:trainers,id'],
            'mode_key' => ['nullable', 'string', 'max:50'],
            'itinerary_notes' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'activities' => ['nullable', 'array'],
            'activities.*.activity_id' => ['required_with:activities', 'integer', 'exists:activities,id'],
            'activities.*.duration_hours' => ['nullable', 'numeric', 'min:0'],
            'activities.*.order' => ['nullable', 'integer', 'min:0'],
            'activities.*.notes' => ['nullable', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // 'booking_id' messages removed - validated in controller
            'date.required' => 'Session date is required.',
            'date.after' => config('booking.messages.date_after'),
            'date.24_hour_advance' => config('booking.messages.date_24_hour_advance'),
            'start_time.required' => 'Start time is required.',
            'start_time.date_format' => 'Start time must be in HH:MM format.',
            'end_time.required' => 'End time is required.',
            'end_time.date_format' => 'End time must be in HH:MM format.',
            'end_time.after' => 'End time must be after start time.',
            'trainer_id.exists' => 'The selected trainer does not exist.',
            'activities.*.activity_id.required_with' => 'Activity ID is required when activities are provided.',
            'activities.*.activity_id.exists' => 'The selected activity does not exist.',
        ];
    }
}

