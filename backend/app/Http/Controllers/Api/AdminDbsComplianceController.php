<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Services\Compliance\DbsExpiryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin DBS compliance overview (expiring and expired checks).
 */
class AdminDbsComplianceController extends Controller
{
    use BaseApiController;

    public function __construct(private readonly DbsExpiryService $dbsExpiry)
    {
    }

    /**
     * GET /api/v1/admin/dbs-compliance
     */
    public function index(Request $request): JsonResponse
    {
        $attentionOnly = $request->query('all') !== '1';

        $staff = $this->dbsExpiry->staffRecords($attentionOnly);
        $trainers = $this->dbsExpiry->trainerRecords($attentionOnly);
        $records = $staff->merge($trainers)->values()->all();

        $attention = $this->dbsExpiry->attentionSummary();

        return $this->successResponse([
            'records' => $records,
            'attentionCount' => $attention['count'],
            'warningDays' => DbsExpiryService::WARNING_DAYS,
        ]);
    }
}
