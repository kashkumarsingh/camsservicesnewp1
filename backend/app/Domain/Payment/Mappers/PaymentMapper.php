<?php

namespace App\Domain\Payment\Mappers;

use App\Domain\Payment\Entities\Payment as PaymentEntity;
use App\Domain\Payment\ValueObjects\PaymentMethod;
use App\Domain\Payment\ValueObjects\PaymentStatus;
use App\Models\Payment as PaymentModel;

/**
 * Payment Mapper
 * 
 * Clean Architecture: Infrastructure Layer (Data Mapping)
 * Purpose: Maps between Eloquent Payment model and Payment domain entity
 * Location: backend/app/Domain/Payment/Mappers/PaymentMapper.php
 */
final class PaymentMapper
{
    /**
     * Map Eloquent model to Payment domain entity.
     */
    public static function fromModel(PaymentModel $model): PaymentEntity
    {
        return PaymentEntity::create(
            id: (string) $model->id,
            amount: (float) $model->amount,
            currency: $model->currency ?? 'GBP',
            method: PaymentMethod::fromString($model->payment_method ?? 'other'),
            status: PaymentStatus::fromString($model->status ?? 'pending'),
            paymentProvider: $model->payment_provider,
            transactionId: $model->transaction_id,
            payableType: $model->payable_type,
            payableId: $model->payable_id ? (string) $model->payable_id : null,
            metadata: $model->metadata ? json_encode($model->metadata) : null,
            failureReason: $model->failure_reason,
            processedAt: $model->processed_at?->toIso8601String(),
            failedAt: $model->failed_at?->toIso8601String(),
            refundedAt: $model->refunded_at?->toIso8601String(),
            retryCount: $model->retry_count ?? 0,
            lastRetryAt: $model->last_retry_at?->toIso8601String(),
            createdAt: $model->created_at?->toIso8601String() ?? now()->toIso8601String(),
            updatedAt: $model->updated_at?->toIso8601String() ?? now()->toIso8601String(),
        );
    }

    /**
     * Map Payment domain entity to array for Eloquent model.
     */
    public static function toArray(PaymentEntity $entity): array
    {
        return [
            'id' => $entity->id(),
            'amount' => $entity->amount(),
            'currency' => $entity->currency(),
            'payment_method' => $entity->method()->toString(),
            'payment_provider' => $entity->paymentProvider(),
            'transaction_id' => $entity->transactionId(),
            'status' => $entity->status()->toString(),
            'payable_type' => $entity->payableType(),
            'payable_id' => $entity->payableId(),
            'metadata' => $entity->metadata() ? json_decode($entity->metadata(), true) : null,
            'failure_reason' => $entity->failureReason(),
            'processed_at' => $entity->processedAt() ? new \DateTime($entity->processedAt()) : null,
            'failed_at' => $entity->failedAt() ? new \DateTime($entity->failedAt()) : null,
            'refunded_at' => $entity->refundedAt() ? new \DateTime($entity->refundedAt()) : null,
            'retry_count' => $entity->retryCount(),
            'last_retry_at' => $entity->lastRetryAt() ? new \DateTime($entity->lastRetryAt()) : null,
        ];
    }
}

