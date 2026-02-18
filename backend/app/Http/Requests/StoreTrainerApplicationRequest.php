<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainerApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'postcode' => ['required', 'string', 'max:12'],
            'address_line_one' => ['nullable', 'string', 'max:120'],
            'address_line_two' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:80'],
            'county' => ['nullable', 'string', 'max:80'],
            'travel_radius_km' => ['required', 'integer', 'min:5', 'max:200'],
            'availability_preferences' => ['nullable', 'array'],
            'excluded_activity_ids' => ['nullable', 'array', 'max:105'], // Activity IDs trainer cannot facilitate
            'excluded_activity_ids.*' => ['required', 'integer', 'exists:activities,id'], // Must be valid activity IDs
            'exclusion_reason' => ['nullable', 'string', 'max:500'], // Reason for limitations
            'preferred_age_groups' => ['nullable', 'array'],
            'preferred_age_groups.*' => ['string', 'max:50'],
            'experience_years' => ['required', 'integer', 'min:0', 'max:60'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'certifications' => ['nullable', 'array'],
            'certifications.*' => ['string', 'max:120'],
            'has_dbs_check' => ['required', 'boolean'],
            'dbs_issued_at' => ['nullable', 'date'],
            'dbs_expires_at' => ['nullable', 'date', 'after_or_equal:dbs_issued_at'],
            'insurance_provider' => ['nullable', 'string', 'max:120'],
            'insurance_expires_at' => ['nullable', 'date'],
            'desired_hourly_rate' => ['nullable', 'numeric', 'min:0'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'excluded_activity_ids.array' => 'Excluded activities must be provided as an array.',
            'excluded_activity_ids.*.exists' => 'One or more activity IDs are invalid.',
            'exclusion_reason.max' => 'Exclusion reason must not exceed 500 characters.',
        ];
    }
}


