<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Expense\ApproveExpenseAction;
use App\Actions\Expense\GetExpenseAction;
use App\Actions\Expense\GetExpenseReceiptStreamAction;
use App\Actions\Expense\GetExpenseAnalyticsAction;
use App\Actions\Expense\ListExpensesAction;
use App\Actions\Expense\RejectExpenseAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Admin Expense Controller
 *
 * In-house spend management: list all expenses, approve/reject.
 * Guards: auth:sanctum + admin middleware
 */
class AdminExpenseController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly ListExpensesAction $listExpensesAction,
        private readonly GetExpenseAction $getExpenseAction,
        private readonly ApproveExpenseAction $approveExpenseAction,
        private readonly RejectExpenseAction $rejectExpenseAction,
        private readonly GetExpenseAnalyticsAction $analyticsAction,
        private readonly GetExpenseReceiptStreamAction $getReceiptStreamAction
    ) {
    }

    /**
     * GET /api/v1/admin/expenses
     * Query: status, user_id, expense_category_id, from_date, to_date, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $filters = array_filter([
            'status' => $request->query('status'),
            'user_id' => $request->query('user_id') ? (int) $request->query('user_id') : null,
            'expense_category_id' => $request->query('expense_category_id') ? (int) $request->query('expense_category_id') : null,
            'from_date' => $request->query('from_date'),
            'to_date' => $request->query('to_date'),
        ]);
        $perPage = max(5, min($request->integer('per_page', 15), 50));
        $paginator = $this->listExpensesAction->forAdmin($filters, $perPage);
        $paginator->getCollection()->transform(fn (Expense $e) => $this->formatExpense($e));
        return $this->paginatedResponse($paginator);
    }

    /**
     * GET /api/v1/admin/expenses/{id}
     */
    public function show(string $id): JsonResponse
    {
        $expense = $this->getExpenseAction->execute((int) $id);
        if (!$expense) {
            return $this->notFoundResponse('Expense');
        }
        return $this->successResponse($this->formatExpense($expense));
    }

    /**
     * POST /api/v1/admin/expenses/{id}/approve
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        try {
            $expense = $this->approveExpenseAction->execute((int) $id, (int) $request->user()->id);
            return $this->successResponse($this->formatExpense($expense), 'Expense approved.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, [], 422);
        }
    }

    /**
     * POST /api/v1/admin/expenses/{id}/reject
     * Body: { "reason": "optional" }
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $reason = $request->input('reason', 'Rejected by admin.');
        try {
            $expense = $this->rejectExpenseAction->execute((int) $id, (int) $request->user()->id, $reason);
            return $this->successResponse($this->formatExpense($expense), 'Expense rejected.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, [], 422);
        }
    }

    /**
     * GET /api/v1/admin/expenses/analytics
     * Query: from_date, to_date (default: current year)
     */
    public function analytics(Request $request): JsonResponse
    {
        $data = $this->analyticsAction->execute(
            $request->query('from_date'),
            $request->query('to_date')
        );
        return $this->successResponse($data);
    }

    /**
     * GET /api/v1/admin/expenses/export
     * Query: format=csv, from_date, to_date, status, user_id, expense_category_id
     */
    public function export(Request $request): StreamedResponse
    {
        $filters = array_filter([
            'status' => $request->query('status'),
            'user_id' => $request->query('user_id') ? (int) $request->query('user_id') : null,
            'expense_category_id' => $request->query('expense_category_id') ? (int) $request->query('expense_category_id') : null,
            'from_date' => $request->query('from_date'),
            'to_date' => $request->query('to_date'),
        ]);
        $perPage = 500;
        $filename = 'expenses-' . now()->format('Y-m-d-His') . '.csv';
        $listAction = $this->listExpensesAction;

        return response()->streamDownload(function () use ($listAction, $filters, $perPage) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'user_id', 'user_name', 'category', 'amount', 'currency', 'expense_date', 'title', 'status', 'approved_at', 'created_at']);
            $page = 1;
            do {
                $paginator = $listAction->forAdmin($filters, $perPage, $page);
                foreach ($paginator->getCollection() as $e) {
                    $e->loadMissing(['user', 'expenseCategory']);
                    fputcsv($handle, [
                        $e->id,
                        $e->user_id,
                        $e->user ? ($e->user->name ?? $e->user->email) : '',
                        $e->expenseCategory ? $e->expenseCategory->name : '',
                        $e->amount,
                        $e->currency,
                        $e->expense_date ? $e->expense_date->format('Y-m-d') : '',
                        $e->title,
                        $e->status,
                        $e->approved_at ? $e->approved_at->toIso8601String() : '',
                        $e->created_at ? $e->created_at->toIso8601String() : '',
                    ]);
                }
                $page++;
            } while ($paginator->hasMorePages());
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * GET /api/v1/admin/expenses/{id}/receipt – download receipt (admin, any expense).
     */
    public function downloadReceipt(Request $request, string $id): JsonResponse|StreamedResponse
    {
        $result = $this->getReceiptStreamAction->execute((int) $id, 0, true);
        if (!$result) {
            return $this->notFoundResponse('Receipt');
        }
        $downloadName = 'receipt-expense-' . $id . '-' . basename($result['path']);
        return $this->getReceiptStreamAction->streamResponse($result['path'], $downloadName);
    }

    private function formatExpense(Expense $e): array
    {
        return [
            'id' => $e->id,
            'userId' => $e->user_id,
            'user' => $e->relationLoaded('user') ? [
                'id' => $e->user->id,
                'name' => $e->user->name ?? $e->user->email,
                'email' => $e->user->email ?? null,
            ] : null,
            'expenseCategoryId' => $e->expense_category_id,
            'expenseCategory' => $e->relationLoaded('expenseCategory') ? [
                'id' => $e->expenseCategory->id,
                'name' => $e->expenseCategory->name,
                'slug' => $e->expenseCategory->slug,
            ] : null,
            'amount' => (float) $e->amount,
            'currency' => $e->currency,
            'expenseDate' => $e->expense_date->format('Y-m-d'),
            'title' => $e->title,
            'description' => $e->description,
            'receiptPath' => $e->receipt_path,
            'status' => $e->status,
            'approvedById' => $e->approved_by_id,
            'approvedBy' => $e->relationLoaded('approvedBy') && $e->approvedBy ? [
                'id' => $e->approvedBy->id,
                'name' => $e->approvedBy->name ?? $e->approvedBy->email,
            ] : null,
            'approvedAt' => $e->approved_at?->toIso8601String(),
            'rejectionReason' => $e->rejection_reason,
            'metadata' => $e->metadata,
            'createdAt' => $e->created_at->toIso8601String(),
            'updatedAt' => $e->updated_at->toIso8601String(),
        ];
    }
}
