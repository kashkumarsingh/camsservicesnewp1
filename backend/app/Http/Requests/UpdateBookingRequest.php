<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Update Booking Request
 * 
 * Clean Architecture: Interface Layer (Validation)
 * Purpose: Validates booking update requests
 */
class UpdateBookingRequest extends FormRequest
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
            'status' => ['sometimes', 'in:draft,pending,confirmed,cancelled,completed'],
            'payment_status' => ['sometimes', 'in:pending,partial,paid,refunded,failed'],
            'parent_first_name' => ['sometimes', 'string', 'max:100'],
            'parent_last_name' => ['sometimes', 'string', 'max:100'],
            'parent_email' => ['sometimes', 'email', 'max:255'],
            'parent_phone' => ['sometimes', 'string', 'max:32'],
            'parent_address' => ['nullable', 'string'],
            'parent_postcode' => ['nullable', 'string', 'max:20'],
            'parent_county' => ['nullable', 'string', 'max:100'],
            'emergency_contact' => ['nullable', 'string', 'max:255'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_reason' => ['nullable', 'string'],
            'payment_plan' => ['nullable', 'in:full,installment'],
            'installment_count' => ['nullable', 'integer', 'min:2', 'max:12'],
            'next_payment_due_at' => ['nullable', 'date'],
            'start_date' => ['nullable', 'date'],
            'package_expires_at' => ['nullable', 'date'],
            'hours_expires_at' => ['nullable', 'date'],
            'allow_hour_rollover' => ['nullable', 'boolean'],
            'admin_notes' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'cancellation_reason' => ['nullable', 'string'],
        ];
    }
}

