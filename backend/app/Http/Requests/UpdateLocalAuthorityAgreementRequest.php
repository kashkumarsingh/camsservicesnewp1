<?php

namespace App\Http\Requests;

use App\Models\LocalAuthorityAgreement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLocalAuthorityAgreementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'local_authority_name' => ['sometimes', 'string', 'max:255'],
            'effective_date' => ['sometimes', 'nullable', 'date'],
            'expires_at' => ['sometimes', 'nullable', 'date'],
            'status' => [
                'sometimes',
                'string',
                Rule::in([
                    LocalAuthorityAgreement::STATUS_DRAFT,
                    LocalAuthorityAgreement::STATUS_ACTIVE,
                    LocalAuthorityAgreement::STATUS_EXPIRED,
                ]),
            ],
            'contact_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'signed_at' => ['sometimes', 'nullable', 'date'],
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
        if ($this->has('signedAt')) {
            $val = $this->input('signedAt');
            $merge['signed_at'] = is_string($val) && trim($val) !== '' ? $val : null;
        }
        if ($merge !== []) {
            $this->merge($merge);
        }
    }
}
