<?php

declare(strict_types=1);

namespace App\Actions\Expense;

use App\Contracts\Expense\IExpenseRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadExpenseReceiptAction
{
    private const DISK = 'local';
    private const RECEIPTS_DIR = 'receipts';

    public function __construct(
        private readonly IExpenseRepository $expenseRepository
    ) {
    }

    public function execute(int $expenseId, int $userId, UploadedFile $file): string
    {
        $expense = $this->expenseRepository->findById($expenseId);
        if (!$expense || $expense->user_id !== $userId) {
            throw new \InvalidArgumentException('Expense not found or access denied.');
        }
        if ($expense->status !== \App\Models\Expense::STATUS_PENDING) {
            throw new \InvalidArgumentException('Receipt can only be uploaded for pending expenses.');
        }

        $extension = $file->getClientOriginalExtension() ?: $file->guessExtension();
        $safeName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $filename = sprintf(
            'expense_%d_%s_%s.%s',
            $expenseId,
            now()->format('YmdHis'),
            Str::limit($safeName, 50),
            $extension ?: 'bin'
        );
        $path = self::RECEIPTS_DIR . '/' . $filename;

        if ($expense->receipt_path) {
            Storage::disk(self::DISK)->delete($expense->receipt_path);
        }

        Storage::disk(self::DISK)->put($path, $file->get());

        $this->expenseRepository->update($expense, ['receipt_path' => $path]);

        return $path;
    }
}
