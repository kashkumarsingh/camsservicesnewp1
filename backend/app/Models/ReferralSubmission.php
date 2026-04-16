<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReferralSubmission extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_REVIEW = 'in_review';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'referrer_name',
        'referrer_role',
        'referrer_email',
        'referrer_phone',
        'young_person_name',
        'young_person_age',
        'school_setting',
        'primary_concern',
        'background_context',
        'success_outcome',
        'preferred_package',
        'additional_info',
        'status',
        'ip_address',
        'user_agent',
    ];
}

