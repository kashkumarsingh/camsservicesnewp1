<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Store Booking Request
 * 
 * Clean Architecture: Interface Layer (Validation)
 * Purpose: Validates booking creation requests
 */
class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Allow guest bookings
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'package_id' => ['required', 'integer', 'exists:packages,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'parent_first_name' => ['required', 'string', 'max:100'],
            'parent_last_name' => ['required', 'string', 'max:100'],
            'parent_email' => ['required', 'email', 'max:255'],
            'parent_phone' => ['required', 'string', 'max:32'],
            'parent_address' => ['nullable', 'string'],
            'parent_postcode' => ['nullable', 'string', 'max:20'],
            'parent_county' => ['nullable', 'string', 'max:100'],
            'emergency_contact' => ['nullable', 'string', 'max:255'],
            'participants' => ['required', 'array', 'min:1'],
            'participants.*.child_id' => ['required', 'integer', 'exists:children,id'],
            'participants.*.first_name' => ['required', 'string', 'max:100'],
            'participants.*.last_name' => ['required', 'string', 'max:100'],
            'participants.*.date_of_birth' => ['required', 'date', 'before:today'],
            'participants.*.medical_info' => ['nullable', 'string'],
            'participants.*.special_needs' => ['nullable', 'string'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_reason' => ['nullable', 'string'],
            'payment_plan' => ['nullable', 'in:full,installment'],
            'installment_count' => ['nullable', 'integer', 'min:2', 'max:12'],
            'start_date' => ['nullable', 'date', 'after_or_equal:today'],
            'package_expires_at' => ['nullable', 'date', 'after:today'],
            'hours_expires_at' => ['nullable', 'date', 'after:today'],
            'allow_hour_rollover' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
            'mode_key' => ['nullable', 'string', 'max:50'], // Booking mode selected during payment
            'modeKey' => ['nullable', 'string', 'max:50'], // Accept camelCase from frontend
        ];
    }

    /**
     * Prepare the data for validation.
     * Convert camelCase to snake_case for mode_key.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('modeKey') && !$this->has('mode_key')) {
            $this->merge([
                'mode_key' => $this->input('modeKey'),
            ]);
        }
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'package_id.required' => 'Please select a package.',
            'package_id.exists' => 'The selected package does not exist.',
            'parent_first_name.required' => 'Parent first name is required.',
            'parent_last_name.required' => 'Parent last name is required.',
            'parent_email.required' => 'Parent email is required.',
            'parent_email.email' => 'Please provide a valid email address.',
            'parent_phone.required' => 'Parent phone number is required.',
            'participants.required' => 'At least one participant (child) is required.',
            'participants.min' => 'At least one participant (child) is required.',
            'participants.*.child_id.required' => 'Child ID is required for each participant.',
            'participants.*.child_id.exists' => 'The selected child does not exist.',
            'participants.*.first_name.required' => 'Participant first name is required.',
            'participants.*.last_name.required' => 'Participant last name is required.',
            'participants.*.date_of_birth.required' => 'Participant date of birth is required.',
            'participants.*.date_of_birth.before' => 'Date of birth must be in the past.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     * Override to return standard API error format instead of Laravel's default.
     *
     * @param \Illuminate\Contracts\Validation\Validator $validator
     * @return void
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator): void
    {
        $errors = $validator->errors()->toArray();
        
        // Generate request ID for tracing
        $requestId = $this->header('X-Request-ID') ?? (string) \Illuminate\Support\Str::uuid();
        
        // Return standard API error format
        throw new \Illuminate\Http\Exceptions\HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $errors,
                'meta' => [
                    'timestamp' => now()->toIso8601String(),
                    'version' => 'v1',
                    'requestId' => $requestId,
                    'errorCode' => \App\Http\Controllers\Api\ErrorCodes::VALIDATION_ERROR,
                ],
            ], 422)
                ->header('X-Request-ID', $requestId)
                ->header('API-Version', 'v1')
        );
    }
}

