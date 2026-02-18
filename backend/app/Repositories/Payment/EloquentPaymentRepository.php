<?php

namespace App\Repositories\Payment;

use App\Domain\Payment\Entities\Payment as PaymentEntity;
use App\Domain\Payment\Mappers\PaymentMapper;
use App\Domain\Payment\Repositories\IPaymentRepository;
use App\Domain\Payment\ValueObjects\PaymentMethod;
use App\Domain\Payment\ValueObjects\PaymentStatus;
use App\Models\Payment as PaymentModel;

/**
 * Eloquent Payment Repository
 * 
 * Clean Architecture: Infrastructure Layer (Repository Implementation)
 * Purpose: Eloquent implementation of payment repository
 * Location: backend/app/Repositories/Payment/EloquentPaymentRepository.php
 * 
 * This repository:
 * - Implements IPaymentRepository interface
 * - Uses Eloquent ORM for data access
 * - Handles all payment CRUD operations
 * - Maps between Eloquent models and domain entities
 */
class EloquentPaymentRepository implements IPaymentRepository
{
    /**
     * Find payment by ID.
     */
    public function findById(string $id): ?PaymentEntity
    {
        $model = PaymentModel::find($id);
        
        if (!$model) {
            return null;
        }

        return PaymentMapper::fromModel($model);
    }

    /**
     * Find payment by transaction ID.
     */
    public function findByTransactionId(string $transactionId): ?PaymentEntity
    {
        $model = PaymentModel::where('transaction_id', $transactionId)->first();
        
        if (!$model) {
            return null;
        }

        return PaymentMapper::fromModel($model);
    }

    /**
     * Find payments for a payable entity (e.g., Booking).
     */
    public function findByPayable(string $payableType, string $payableId): array
    {
        $models = PaymentModel::where('payable_type', $payableType)
            ->where('payable_id', $payableId)
            ->orderBy('created_at', 'desc')
            ->get();

        return $models->map(fn ($model) => PaymentMapper::fromModel($model))->toArray();
    }

    /**
     * Save payment (create or update).
     */
    public function save(PaymentEntity $payment): PaymentEntity
    {
        $data = PaymentMapper::toArray($payment);
        $id = $data['id'];
        unset($data['id']); // Remove ID for update

        $model = PaymentModel::find($id);
        
        if ($model) {
            $model->update($data);
            $model->refresh();
        } else {
            $data['id'] = $id; // Add ID back for create
            $model = PaymentModel::create($data);
        }

        return PaymentMapper::fromModel($model);
    }

    /**
     * Create a new payment.
     */
    public function create(array $data): PaymentEntity
    {
        $model = PaymentModel::create([
            'payable_type' => $data['payable_type'] ?? null,
            'payable_id' => $data['payable_id'] ?? null,
            'amount' => $data['amount'],
            'currency' => $data['currency'] ?? 'GBP',
            'payment_method' => $data['payment_method'] ?? 'other',
            'payment_provider' => $data['payment_provider'] ?? null,
            'transaction_id' => $data['transaction_id'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'metadata' => $data['metadata'] ?? null,
            'failure_reason' => $data['failure_reason'] ?? null,
            'retry_count' => $data['retry_count'] ?? 0,
        ]);

        return PaymentMapper::fromModel($model);
    }

    /**
     * Update payment status.
     */
    public function updateStatus(string $id, string $status, ?string $processedAt = null): bool
    {
        $model = PaymentModel::find($id);
        
        if (!$model) {
            return false;
        }

        $model->status = $status;
        
        if ($processedAt) {
            $model->processed_at = new \DateTime($processedAt);
        } elseif ($status === 'completed') {
            $model->processed_at = now();
        }

        return $model->save();
    }

    /**
     * Update payment transaction ID and status.
     */
    public function updateTransactionAndStatus(string $id, ?string $transactionId, string $status, ?array $metadata = null): bool
    {
        $model = PaymentModel::find($id);
        
        if (!$model) {
            return false;
        }

        $model->transaction_id = $transactionId;
        $model->status = $status;
        
        if ($metadata) {
            $currentMetadata = $model->metadata ?? [];
            $model->metadata = array_merge($currentMetadata, $metadata);
        }
        
        if ($status === 'completed') {
            $model->processed_at = now();
        } elseif ($status === 'processing') {
            // Keep existing processed_at or set to null
        }

        return $model->save();
    }

    /**
     * Mark payment as failed.
     */
    public function markAsFailed(string $id, string $reason): bool
    {
        $model = PaymentModel::find($id);
        
        if (!$model) {
            return false;
        }

        $model->markAsFailed($reason);
        
        return true;
    }

    /**
     * Mark payment as refunded.
     */
    public function markAsRefunded(string $id, ?string $refundedAt = null): bool
    {
        $model = PaymentModel::find($id);
        
        if (!$model) {
            return false;
        }

        $model->status = 'refunded';
        
        if ($refundedAt) {
            $model->refunded_at = new \DateTime($refundedAt);
        } else {
            $model->refunded_at = now();
        }

        return $model->save();
    }
}

