<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'email' => ['required', 'email:rfc,dns', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
            'address' => ['nullable', 'string', 'max:500'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'child_age' => ['nullable', 'string', 'max:32'],
            'inquiry_type' => ['required', Rule::in(['package', 'service', 'general', 'other'])],
            'inquiry_details' => ['nullable', 'string', 'max:255'],
            'urgency' => ['required', Rule::in(['urgent', 'soon', 'exploring'])],
            'preferred_contact' => ['required', Rule::in(['email', 'phone', 'whatsapp'])],
            'message' => ['nullable', 'string', 'max:5000'],
            'newsletter' => ['sometimes', 'boolean'],
            'source_page' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'newsletter' => filter_var($this->input('newsletter', false), FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}

