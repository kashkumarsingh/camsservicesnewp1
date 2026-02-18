<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Expense\CreateExpenseAction;
use App\Actions\Expense\GetExpenseAction;
use App\Actions\Expense\GetExpenseReceiptStreamAction;
use App\Actions\Expense\ListExpenseCategoriesAction;
use App\Actions\Expense\ListExpensesAction;
use App\Actions\Expense\UploadExpenseReceiptAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Expense Controller (submit and list own expenses)
 *
 * In-house spend management: submit expense claims, list own, list categories.
 * Guards: auth:sanctum
 */
class ExpenseController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly ListExpensesAction $listExpensesAction,
        private readonly ListExpenseCategoriesAction $listCategoriesAction,
        private readonly GetExpenseAction $getExpenseAction,
        private readonly CreateExpenseAction $createExpenseAction,
        private readonly UploadExpenseReceiptAction $uploadReceiptAction,
        private readonly GetExpenseReceiptStreamAction $getReceiptStreamAction
    ) {
    }

    /**
     * GET /api/v1/expenses – current user's expenses
     * Query: status, expense_category_id, from_date, to_date
     */
    public function index(Request $request): JsonResponse
    {
        $filters = array_filter([
            'status' => $request->query('status'),
            'expense_category_id' => $request->query('expense_category_id') ? (int) $request->query('expense_category_id') : null,
            'from_date' => $request->query('from_date'),
            'to_date' => $request->query('to_date'),
        ]);
        $expenses = $this->listExpensesAction->forUser((int) $request->user()->id, $filters);
        $data = $expenses->map(fn (Expense $e) => $this->formatExpense($e));
        return $this->successResponse($data);
    }

    /**
     * GET /api/v1/expenses/{id} – single expense (own only)
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $expense = $this->getExpenseAction->execute((int) $id);
        if (!$expense || $expense->user_id !== (int) $request->user()->id) {
            return $this->notFoundResponse('Expense');
        }
        return $this->successResponse($this->formatExpense($expense));
    }

    /**
     * POST /api/v1/expenses – submit new expense
     * Body: expense_category_id, amount, expense_date, title, description?, currency?, receipt_path?
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'expense_category_id' => 'required|integer|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'currency' => 'nullable|string|size:3',
            'receipt_path' => 'nullable|string|max:500',
        ]);
        if ($validator->fails()) {
            return $this->errorResponse('Validation failed.', null, $validator->errors()->toArray(), 422);
        }
        try {
            $expense = $this->createExpenseAction->execute((int) $request->user()->id, $validator->validated());
            return $this->successResponse($this->formatExpense($expense->load(['expenseCategory'])), 'Expense submitted.', [], 201);
        } catch (\DomainException $e) {
            return $this->errorResponse($e->getMessage(), null, [], 422);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Create expense failed', ['error' => $e->getMessage()]);
            return $this->serverErrorResponse('Failed to submit expense.');
        }
    }

    /**
     * POST /api/v1/expenses/{id}/receipt – upload receipt (image or PDF). Own expense only.
     */
    public function uploadReceipt(Request $request, string $id): JsonResponse
    {
        $request->validate(['receipt' => 'required|file|mimes:jpeg,jpg,png,gif,webp,pdf|max:10240']);
        try {
            $path = $this->uploadReceiptAction->execute((int) $id, (int) $request->user()->id, $request->file('receipt'));
            $expense = $this->getExpenseAction->execute((int) $id);
            return $this->successResponse($this->formatExpense($expense), 'Receipt uploaded.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, [], 403);
        }
    }

    /**
     * GET /api/v1/expenses/{id}/receipt – download receipt (owner only; or admin via admin route).
     */
    public function downloadReceipt(Request $request, string $id): JsonResponse|\Symfony\Component\HttpFoundation\StreamedResponse
    {
        $result = $this->getReceiptStreamAction->execute((int) $id, (int) $request->user()->id, false);
        if (!$result) {
            return $this->notFoundResponse('Receipt');
        }
        $downloadName = 'receipt-expense-' . $id . '-' . basename($result['path']);
        return $this->getReceiptStreamAction->streamResponse($result['path'], $downloadName);
    }

    /**
     * GET /api/v1/expense-categories – list categories (for dropdown)
     */
    public function categories(): JsonResponse
    {
        $categories = $this->listCategoriesAction->execute(true);
        $data = $categories->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'slug' => $c->slug,
            'description' => $c->description,
        ]);
        return $this->successResponse($data);
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
