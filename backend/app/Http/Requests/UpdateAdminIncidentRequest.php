<?php

namespace App\Http\Requests;

use App\Models\Incident;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'sometimes',
                'string',
                Rule::in([
                    Incident::STATUS_OPEN,
                    Incident::STATUS_REVIEWING,
                    Incident::STATUS_CLOSED,
                ]),
            ],
            'follow_up_notes' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'immediate_actions' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'dsl_reviewed' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $merge = [];
        if ($this->has('followUpNotes')) {
            $val = $this->input('followUpNotes');
            $merge['follow_up_notes'] = is_string($val) ? $val : null;
        }
        if ($this->has('immediateActions')) {
            $val = $this->input('immediateActions');
            $merge['immediate_actions'] = is_string($val) ? $val : null;
        }
        if ($this->has('dslReviewed')) {
            $merge['dsl_reviewed'] = $this->boolean('dslReviewed');
        }
        if ($merge !== []) {
            $this->merge($merge);
        }
    }
}
