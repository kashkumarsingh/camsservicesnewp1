<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Update Booking Schedule Request
 * 
 * Clean Architecture: Interface Layer (Validation)
 * Purpose: Validates booking schedule update requests
 */
class UpdateBookingScheduleRequest extends FormRequest
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
        return [
            'date' => ['sometimes', 'date'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => [
                'sometimes',
                'date_format:H:i',
                function ($attribute, $value, $fail) {
                    $startTime = $this->input('start_time');
                    if ($startTime && $value) {
                        $start = strtotime($startTime);
                        $end = strtotime($value);
                        if ($end === $start) {
                            $fail('End time must be after start time.');
                        }
                        // end != start is valid (same-day or next-day span)
                    }
                },
            ],
            'trainer_id' => ['nullable', 'integer', 'exists:trainers,id'],
            'status' => ['sometimes', 'in:scheduled,completed,cancelled,no_show,rescheduled'],
            'mode_key' => ['nullable', 'string', 'max:50'],
            'itinerary_notes' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'reschedule_reason' => ['nullable', 'string'],
            'cancellation_reason' => ['nullable', 'string'],
            'actual_start_time' => ['nullable', 'date_format:H:i'],
            'actual_end_time' => ['nullable', 'date_format:H:i', 'after:actual_start_time'],
            'order' => ['nullable', 'integer', 'min:0'],
            'activities' => ['nullable', 'array'],
            'activities.*.activity_id' => ['required_with:activities', 'integer', 'exists:activities,id'],
            'activities.*.duration_hours' => ['nullable', 'numeric', 'min:0'],
            'activities.*.order' => ['nullable', 'integer', 'min:0'],
            'activities.*.notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

