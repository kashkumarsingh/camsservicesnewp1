<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSafeguardingConcernRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'concern_type' => ['required', 'string', Rule::in(['safety', 'behaviour', 'environment', 'other'])],
            'description' => ['required', 'string', 'min:20', 'max:10000'],
            'child_id' => [
                'nullable',
                'integer',
                Rule::exists('children', 'id')->where('user_id', $this->user()?->id),
            ],
            'date_of_concern' => ['nullable', 'date'],
            'contact_preference' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Accept camelCase from frontend and map to snake_case for validation/storage.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];
        if ($this->has('concernType')) {
            $merge['concern_type'] = $this->input('concernType');
        }
        if ($this->has('childId')) {
            $val = $this->input('childId');
            $merge['child_id'] = ($val !== '' && $val !== null) ? (int) $val : null;
        }
        if ($this->has('dateOfConcern')) {
            $val = $this->input('dateOfConcern');
            $merge['date_of_concern'] = is_string($val) && trim($val) !== '' ? $val : null;
        }
        if ($this->has('contactPreference')) {
            $val = $this->input('contactPreference');
            $merge['contact_preference'] = is_string($val) && trim($val) !== '' ? trim($val) : null;
        }
        if ($merge !== []) {
            $this->merge($merge);
        }
    }
}
