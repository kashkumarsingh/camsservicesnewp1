<?php

namespace App\Http\Requests;

use App\Models\LocalAuthorityAgreement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLocalAuthorityAgreementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'local_authority_name' => ['required', 'string', 'max:255'],
            'effective_date' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:effective_date'],
            'status' => [
                'sometimes',
                'string',
                Rule::in([
                    LocalAuthorityAgreement::STATUS_DRAFT,
                    LocalAuthorityAgreement::STATUS_ACTIVE,
                    LocalAuthorityAgreement::STATUS_EXPIRED,
                ]),
            ],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string', 'max:10000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $merge = [];
        if ($this->has('localAuthorityName')) {
            $merge['local_authority_name'] = $this->input('localAuthorityName');
        }
        if ($this->has('effectiveDate')) {
            $val = $this->input('effectiveDate');
            $merge['effective_date'] = is_string($val) && trim($val) !== '' ? $val : null;
        }
        if ($this->has('expiresAt')) {
            $val = $this->input('expiresAt');
            $merge['expires_at'] = is_string($val) && trim($val) !== '' ? $val : null;
        }
        if ($this->has('contactName')) {
            $merge['contact_name'] = $this->input('contactName');
        }
        if ($this->has('contactEmail')) {
            $merge['contact_email'] = $this->input('contactEmail');
        }
        if ($merge !== []) {
            $this->merge($merge);
        }
    }
}
