<?php

declare(strict_types=1);

namespace App\Actions\Expense;

use App\Contracts\Expense\IExpenseRepository;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GetExpenseReceiptStreamAction
{
    private const DISK = 'local';

    public function __construct(
        private readonly IExpenseRepository $expenseRepository
    ) {
    }

    /**
     * @return array{path: string, expense: \App\Models\Expense}|null
     */
    public function execute(int $expenseId, int $userId, bool $isAdmin): ?array
    {
        $expense = $this->expenseRepository->findById($expenseId);
        if (!$expense) {
            return null;
        }
        if (!$isAdmin && $expense->user_id !== $userId) {
            return null;
        }
        if (!$expense->receipt_path || !Storage::disk(self::DISK)->exists($expense->receipt_path)) {
            return null;
        }
        return ['path' => $expense->receipt_path, 'expense' => $expense];
    }

    public function streamResponse(string $path, ?string $downloadName = null): StreamedResponse
    {
        $name = $downloadName ?? basename($path);
        return Storage::disk(self::DISK)->response($path, $name, [
            'Content-Type' => Storage::disk(self::DISK)->mimeType($path) ?: 'application/octet-stream',
        ]);
    }
}
