<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReferralSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'referrer_name' => ['required', 'string', 'max:200'],
            'referrer_role' => ['required', 'string', 'max:200'],
            'referrer_email' => ['required', 'email:rfc', 'max:255'],
            'referrer_phone' => ['required', 'string', 'max:32'],
            'young_person_name' => ['required', 'string', 'max:200'],
            'young_person_age' => ['required', 'string', 'max:32'],
            'school_setting' => ['nullable', 'string', 'max:255'],
            'primary_concern' => ['required', 'string', 'max:255'],
            'background_context' => ['required', 'string', 'max:5000'],
            'success_outcome' => ['required', 'string', 'max:5000'],
            'preferred_package' => ['required', 'string', 'max:255'],
            'additional_info' => ['nullable', 'string', 'max:5000'],
        ];
    }
}

