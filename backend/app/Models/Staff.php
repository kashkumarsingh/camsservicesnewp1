<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';

    public const VISA_BRITISH_CITIZEN = 'british_citizen';
    public const VISA_IRISH_CITIZEN = 'irish_citizen';
    public const VISA_SETTLED_STATUS = 'settled_status';
    public const VISA_PRE_SETTLED_STATUS = 'pre_settled_status';
    public const VISA_SKILLED_WORKER = 'skilled_worker';
    public const VISA_HEALTH_CARE = 'health_care';
    public const VISA_STUDENT = 'student';
    public const VISA_DEPENDENT = 'dependent';
    public const VISA_OTHER = 'other';

    public const EMPLOYMENT_ACTIVE = 'active';
    public const EMPLOYMENT_ON_LEAVE = 'on_leave';
    public const EMPLOYMENT_OFFBOARDED = 'offboarded';

    public const VISA_STATUSES = [
        self::VISA_BRITISH_CITIZEN,
        self::VISA_IRISH_CITIZEN,
        self::VISA_SETTLED_STATUS,
        self::VISA_PRE_SETTLED_STATUS,
        self::VISA_SKILLED_WORKER,
        self::VISA_HEALTH_CARE,
        self::VISA_STUDENT,
        self::VISA_DEPENDENT,
        self::VISA_OTHER,
    ];

    public const EMPLOYMENT_STATUSES = [
        self::EMPLOYMENT_ACTIVE,
        self::EMPLOYMENT_ON_LEAVE,
        self::EMPLOYMENT_OFFBOARDED,
    ];

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address_line_one',
        'address_line_two',
        'city',
        'county',
        'postcode',
        'job_title',
        'department',
        'citizenship',
        'visa_status',
        'right_to_work_verified',
        'right_to_work_verified_at',
        'right_to_work_expires_at',
        'start_date',
        'employment_status',
        'has_dbs_check',
        'dbs_certificate_number',
        'dbs_issued_at',
        'dbs_expires_at',
        'emergency_contact_name',
        'emergency_contact_phone',
        'notes',
        'onboarded_by',
        'onboarded_at',
    ];

    protected $casts = [
        'right_to_work_verified' => 'boolean',
        'right_to_work_verified_at' => 'date',
        'right_to_work_expires_at' => 'date',
        'start_date' => 'date',
        'has_dbs_check' => 'boolean',
        'dbs_issued_at' => 'date',
        'dbs_expires_at' => 'date',
        'onboarded_at' => 'date',
    ];

    public function onboardedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'onboarded_by');
    }
}
