<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * Admin Staff Controller — internal staff onboarding records (distinct from trainers).
 */
class AdminStaffController extends Controller
{
    use BaseApiController;

    /**
     * GET /api/v1/admin/staff
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Staff::query()->with('onboardedBy:id,name');

            if ($status = $request->query('employment_status')) {
                $query->where('employment_status', $status);
            }

            if ($visaStatus = $request->query('visa_status')) {
                $query->where('visa_status', $visaStatus);
            }

            if ($search = trim((string) $request->query('search', ''))) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('job_title', 'like', "%{$search}%");
                });
            }

            $limit = max(1, min($request->integer('limit', 100), 200));
            $offset = max(0, $request->integer('offset', 0));
            $totalCount = (clone $query)->count();

            $staff = $query
                ->orderByDesc('created_at')
                ->skip($offset)
                ->take($limit)
                ->get();

            $formatted = $staff->map(fn (Staff $s) => $this->formatStaff($s));

            return $this->collectionResponse(
                $formatted,
                null,
                [
                    'limit' => $limit,
                    'offset' => $offset,
                    'total_count' => $totalCount,
                ]
            );
        } catch (\Exception $e) {
            Log::error('Error listing admin staff', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve staff records.');
        }
    }

    /**
     * GET /api/v1/admin/staff/{id}
     */
    public function show(int $id): JsonResponse
    {
        try {
            $staff = Staff::with('onboardedBy:id,name')->find($id);

            if (! $staff) {
                return $this->notFoundResponse('Staff member');
            }

            return $this->successResponse($this->formatStaff($staff));
        } catch (\Exception $e) {
            Log::error('Error retrieving staff member', [
                'staff_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve staff record.');
        }
    }

    /**
     * POST /api/v1/admin/staff
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $payload = $this->mergeCamelCaseAliases($request);
            $validator = Validator::make($payload, $this->validationRules());

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors()->toArray());
            }

            $data = $this->normalizeInput($request);
            $data['onboarded_by'] = auth()->id();
            $data['onboarded_at'] = $data['onboarded_at'] ?? now()->toDateString();

            $staff = Staff::create($data);
            $staff->load('onboardedBy:id,name');

            return $this->successResponse($this->formatStaff($staff), 'Staff member onboarded successfully', [], 201);
        } catch (\Exception $e) {
            Log::error('Error creating staff member', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to create staff record.');
        }
    }

    /**
     * PUT/PATCH /api/v1/admin/staff/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $staff = Staff::find($id);

            if (! $staff) {
                return $this->notFoundResponse('Staff member');
            }

            $payload = $this->mergeCamelCaseAliases($request);
            $validator = Validator::make($payload, $this->validationRules(isUpdate: true));

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors()->toArray());
            }

            $staff->update($this->normalizeInput($request, onlyProvided: true));
            $staff->load('onboardedBy:id,name');

            return $this->successResponse($this->formatStaff($staff), 'Staff record updated successfully');
        } catch (\Exception $e) {
            Log::error('Error updating staff member', [
                'staff_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->serverErrorResponse('Failed to update staff record.');
        }
    }

    /**
     * DELETE /api/v1/admin/staff/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $staff = Staff::find($id);

            if (! $staff) {
                return $this->notFoundResponse('Staff member');
            }

            $staff->delete();

            return $this->successResponse(null, 'Staff record deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting staff member', [
                'staff_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->serverErrorResponse('Failed to delete staff record.');
        }
    }

    /**
     * GET /api/v1/admin/staff/export
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $staff = Staff::query()->orderBy('name')->get();
            $formatted = $staff->map(fn (Staff $s) => $this->formatStaff($s));

            return $this->collectionResponse($formatted);
        } catch (\Exception $e) {
            Log::error('Error exporting staff', ['error' => $e->getMessage()]);

            return $this->serverErrorResponse('Failed to export staff records.');
        }
    }

    private function validationRules(bool $isUpdate = false): array
    {
        $required = $isUpdate ? 'sometimes' : 'required';

        return [
            'name' => "{$required}|string|max:255",
            'email' => 'nullable|string|email|max:255',
            'phone' => ['nullable', 'string', 'max:50', 'regex:/^(\+44\s?|0)(\d{2,4}\s?\d{3,4}\s?\d{3,4})$/'],
            'address_line_one' => 'nullable|string|max:255',
            'address_line_two' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'county' => 'nullable|string|max:100',
            'postcode' => ['nullable', 'string', 'max:20', 'regex:/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i'],
            'job_title' => "{$required}|string|max:255",
            'department' => 'nullable|string|max:255',
            'citizenship' => 'nullable|string|max:100',
            'visa_status' => ['nullable', 'string', Rule::in(Staff::VISA_STATUSES)],
            'right_to_work_verified' => 'nullable|boolean',
            'right_to_work_verified_at' => 'nullable|date',
            'right_to_work_expires_at' => 'nullable|date',
            'start_date' => 'nullable|date',
            'employment_status' => ['nullable', 'string', Rule::in(Staff::EMPLOYMENT_STATUSES)],
            'has_dbs_check' => 'nullable|boolean',
            'dbs_certificate_number' => 'nullable|string|max:100',
            'dbs_issued_at' => 'nullable|date',
            'dbs_expires_at' => 'nullable|date',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:5000',
            'onboarded_at' => 'nullable|date',
        ];
    }

    /**
     * Merge camelCase request keys to snake_case for validation.
     */
    private function mergeCamelCaseAliases(Request $request): array
    {
        $aliases = [
            'addressLineOne' => 'address_line_one',
            'addressLineTwo' => 'address_line_two',
            'jobTitle' => 'job_title',
            'visaStatus' => 'visa_status',
            'rightToWorkVerified' => 'right_to_work_verified',
            'rightToWorkVerifiedAt' => 'right_to_work_verified_at',
            'rightToWorkExpiresAt' => 'right_to_work_expires_at',
            'startDate' => 'start_date',
            'employmentStatus' => 'employment_status',
            'hasDbsCheck' => 'has_dbs_check',
            'dbsCertificateNumber' => 'dbs_certificate_number',
            'dbsIssuedAt' => 'dbs_issued_at',
            'dbsExpiresAt' => 'dbs_expires_at',
            'emergencyContactName' => 'emergency_contact_name',
            'emergencyContactPhone' => 'emergency_contact_phone',
            'onboardedAt' => 'onboarded_at',
        ];

        $merged = $request->all();

        foreach ($aliases as $camel => $snake) {
            if ($request->has($camel) && ! $request->has($snake)) {
                $merged[$snake] = $request->input($camel);
            }
        }

        return $merged;
    }

    private function normalizeInput(Request $request, bool $onlyProvided = false): array
    {
        $map = [
            'name' => 'name',
            'email' => 'email',
            'phone' => 'phone',
            'address_line_one' => ['address_line_one', 'addressLineOne'],
            'address_line_two' => ['address_line_two', 'addressLineTwo'],
            'city' => 'city',
            'county' => 'county',
            'postcode' => 'postcode',
            'job_title' => ['job_title', 'jobTitle'],
            'department' => 'department',
            'citizenship' => 'citizenship',
            'visa_status' => ['visa_status', 'visaStatus'],
            'right_to_work_verified' => ['right_to_work_verified', 'rightToWorkVerified'],
            'right_to_work_verified_at' => ['right_to_work_verified_at', 'rightToWorkVerifiedAt'],
            'right_to_work_expires_at' => ['right_to_work_expires_at', 'rightToWorkExpiresAt'],
            'start_date' => ['start_date', 'startDate'],
            'employment_status' => ['employment_status', 'employmentStatus'],
            'has_dbs_check' => ['has_dbs_check', 'hasDbsCheck'],
            'dbs_certificate_number' => ['dbs_certificate_number', 'dbsCertificateNumber'],
            'dbs_issued_at' => ['dbs_issued_at', 'dbsIssuedAt'],
            'dbs_expires_at' => ['dbs_expires_at', 'dbsExpiresAt'],
            'emergency_contact_name' => ['emergency_contact_name', 'emergencyContactName'],
            'emergency_contact_phone' => ['emergency_contact_phone', 'emergencyContactPhone'],
            'notes' => 'notes',
            'onboarded_at' => ['onboarded_at', 'onboardedAt'],
        ];

        $data = [];

        foreach ($map as $dbKey => $requestKeys) {
            $keys = is_array($requestKeys) ? $requestKeys : [$requestKeys];

            if ($onlyProvided && ! $this->requestHasAny($request, $keys)) {
                continue;
            }

            foreach ($keys as $key) {
                if ($request->has($key)) {
                    $value = $request->input($key);
                    if ($dbKey === 'postcode' && is_string($value)) {
                        $value = strtoupper(trim($value));
                    }
                    $data[$dbKey] = $value;
                    break;
                }
            }
        }

        if (! $onlyProvided) {
            $data['visa_status'] = $data['visa_status'] ?? Staff::VISA_BRITISH_CITIZEN;
            $data['employment_status'] = $data['employment_status'] ?? Staff::EMPLOYMENT_ACTIVE;
            $data['right_to_work_verified'] = (bool) ($data['right_to_work_verified'] ?? false);
            $data['has_dbs_check'] = (bool) ($data['has_dbs_check'] ?? false);
        }

        return $data;
    }

    private function requestHasAny(Request $request, array $keys): bool
    {
        foreach ($keys as $key) {
            if ($request->has($key)) {
                return true;
            }
        }

        return false;
    }

    private function formatStaff(Staff $staff): array
    {
        return [
            'id' => (string) $staff->id,
            'name' => $staff->name,
            'email' => $staff->email,
            'phone' => $staff->phone,
            'addressLineOne' => $staff->address_line_one,
            'addressLineTwo' => $staff->address_line_two,
            'city' => $staff->city,
            'county' => $staff->county,
            'postcode' => $staff->postcode,
            'jobTitle' => $staff->job_title,
            'department' => $staff->department,
            'citizenship' => $staff->citizenship,
            'visaStatus' => $staff->visa_status,
            'rightToWorkVerified' => (bool) $staff->right_to_work_verified,
            'rightToWorkVerifiedAt' => $staff->right_to_work_verified_at?->toDateString(),
            'rightToWorkExpiresAt' => $staff->right_to_work_expires_at?->toDateString(),
            'startDate' => $staff->start_date?->toDateString(),
            'employmentStatus' => $staff->employment_status,
            'hasDbsCheck' => (bool) $staff->has_dbs_check,
            'dbsCertificateNumber' => $staff->dbs_certificate_number,
            'dbsIssuedAt' => $staff->dbs_issued_at?->toDateString(),
            'dbsExpiresAt' => $staff->dbs_expires_at?->toDateString(),
            'emergencyContactName' => $staff->emergency_contact_name,
            'emergencyContactPhone' => $staff->emergency_contact_phone,
            'notes' => $staff->notes,
            'onboardedById' => $staff->onboarded_by ? (string) $staff->onboarded_by : null,
            'onboardedByName' => $staff->onboardedBy?->name,
            'onboardedAt' => $staff->onboarded_at?->toDateString(),
            'createdAt' => $staff->created_at?->toIso8601String(),
            'updatedAt' => $staff->updated_at?->toIso8601String(),
        ];
    }
}
