<?php

namespace App\Http\Requests;

use App\Models\Incident;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTrainerIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'incident_type' => [
                'required',
                'string',
                Rule::in([
                    Incident::TYPE_SAFEGUARDING,
                    Incident::TYPE_ACCIDENT,
                    Incident::TYPE_NEAR_MISS,
                    Incident::TYPE_TRANSPORT,
                    Incident::TYPE_MISSING_CHILD,
                    Incident::TYPE_DATA_BREACH,
                    Incident::TYPE_OTHER,
                ]),
            ],
            'severity' => [
                'required',
                'string',
                Rule::in([
                    Incident::SEVERITY_LOW,
                    Incident::SEVERITY_MEDIUM,
                    Incident::SEVERITY_HIGH,
                    Incident::SEVERITY_CRITICAL,
                ]),
            ],
            'description' => ['required', 'string', 'min:20', 'max:10000'],
            'location' => ['nullable', 'string', 'max:500'],
            'occurred_at' => ['nullable', 'date'],
            'child_id' => ['nullable', 'integer', 'exists:children,id'],
            'booking_schedule_id' => ['nullable', 'integer', 'exists:booking_schedules,id'],
            'immediate_actions' => ['nullable', 'string', 'max:5000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $merge = [];
        if ($this->has('incidentType')) {
            $merge['incident_type'] = $this->input('incidentType');
        }
        if ($this->has('childId')) {
            $val = $this->input('childId');
            $merge['child_id'] = ($val !== '' && $val !== null) ? (int) $val : null;
        }
        if ($this->has('bookingScheduleId')) {
            $val = $this->input('bookingScheduleId');
            $merge['booking_schedule_id'] = ($val !== '' && $val !== null) ? (int) $val : null;
        }
        if ($this->has('occurredAt')) {
            $val = $this->input('occurredAt');
            $merge['occurred_at'] = is_string($val) && trim($val) !== '' ? $val : null;
        }
        if ($this->has('immediateActions')) {
            $val = $this->input('immediateActions');
            $merge['immediate_actions'] = is_string($val) && trim($val) !== '' ? trim($val) : null;
        }
        if ($merge !== []) {
            $this->merge($merge);
        }
    }
}
