<?php

namespace App\Actions\ContactSubmissions;

use App\Events\ContactSubmissionCreated;
use App\Models\ContactSubmission;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Create Contact Submission Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for creating contact submissions
 * Location: backend/app/Actions/ContactSubmissions/CreateContactSubmissionAction.php
 * 
 * This action handles:
 * - Creating contact submissions
 * - Duplicate detection (email and IP-based locking)
 * - Business rules for submission validation
 * 
 * Phase 1: Current implementation uses Redis locks for duplicate prevention
 * Phase 2: Will introduce message queue for async processing and enhanced rate limiting
 * 
 * The Application Layer depends on the Domain Layer (ContactSubmission model)
 * but is independent of the Interface Layer (Controllers).
 */
class CreateContactSubmissionAction
{
    /**
     * Execute the action to create a contact submission.
     *
     * @param array $data Submission data
     * @return ContactSubmission
     * @throws \RuntimeException If duplicate submission detected
     */
    public function execute(array $data): ContactSubmission
    {
        $email = $data['email'];
        $ipAddress = $data['ip_address'] ?? null;

        // Use distributed lock (cache-based) to prevent race conditions
        // This ensures only one submission can be created at a time for the same email/IP
        $emailLockKey = 'contact_submission_lock_email:' . md5($email);
        $ipLockKey = $ipAddress ? 'contact_submission_lock_ip:' . md5($ipAddress) : null;

        // Try to acquire lock for email (5 minutes - longer window to prevent duplicates)
        $emailLock = Cache::lock($emailLockKey, 300); // 5 minutes
        if (!$emailLock->get()) {
            throw new \RuntimeException('You have already submitted a form recently. Please wait a moment before submitting again.');
        }

        // Try to acquire lock for IP (3 minutes)
        $ipLock = null;
        if ($ipLockKey) {
            $ipLock = Cache::lock($ipLockKey, 180); // 3 minutes
            if (!$ipLock->get()) {
                $emailLock->release();
                throw new \RuntimeException('Please wait a moment before submitting again.');
            }
        }

        try {
            // Use database transaction with row-level locking as additional protection
            return DB::transaction(function () use ($data, $email, $ipAddress) {
                // Double-check for duplicates within transaction (5 min window for email, 3 min for IP)
                $emailDuplicate = ContactSubmission::where('email', $email)
                    ->where('created_at', '>=', now()->subMinutes(5))
                    ->lockForUpdate()
                    ->exists();

                if ($emailDuplicate) {
                    throw new \RuntimeException('You have already submitted a form recently. Please wait a moment before submitting again.');
                }

                // Check IP (3 min window) with locking
                if ($ipAddress) {
                    $ipDuplicate = ContactSubmission::where('ip_address', $ipAddress)
                        ->where('created_at', '>=', now()->subMinutes(3))
                        ->lockForUpdate()
                        ->exists();

                    if ($ipDuplicate) {
                        throw new \RuntimeException('Please wait a moment before submitting again.');
                    }
                }

                // Create submission within the transaction
                // If another request tries to create at the same time, it will wait for this transaction
                // Note: duplicate_prevention_hash is auto-populated by database trigger (if migration applied)
                $submission = ContactSubmission::create([
                    'name' => $data['name'],
                    'email' => $email,
                    'phone' => $data['phone'] ?? null,
                    'address' => $data['address'] ?? null,
                    'postal_code' => $data['postal_code'] ?? null,
                    'child_age' => $data['child_age'] ?? null,
                    'inquiry_type' => $data['inquiry_type'],
                    'inquiry_details' => $data['inquiry_details'] ?? null,
                    'urgency' => $data['urgency'],
                    'preferred_contact' => $data['preferred_contact'],
                    'message' => $data['message'] ?? null,
                    'newsletter' => $data['newsletter'] ?? false,
                    'source_page' => $data['source_page'] ?? null,
                    'status' => ContactSubmission::STATUS_PENDING,
                    'ip_address' => $ipAddress,
                    'user_agent' => $data['user_agent'] ?? null,
                ]);

                Log::info('Contact submission created', [
                    'submission_id' => $submission->id,
                    'email' => $submission->email,
                    'inquiry_type' => $submission->inquiry_type,
                ]);

                event(new ContactSubmissionCreated($submission));

                return $submission;
            });
        } finally {
            // Always release locks, even if transaction fails
            $emailLock->release();
            if ($ipLock) {
                $ipLock->release();
            }
        }
    }
}

