<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validation for trainer acknowledging or adding a note to a safeguarding concern.
 */
class UpdateTrainerSafeguardingConcernRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'acknowledged' => ['sometimes', 'boolean'],
            'note' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ];
    }
}
