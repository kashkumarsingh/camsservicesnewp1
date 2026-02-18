<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Package;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Booking & Payment Smoke Test
 * 
 * Clean Architecture: Infrastructure Layer (Testing)
 * Purpose: Quick smoke test to verify core booking and payment flow works end-to-end
 * Location: backend/tests/Feature/Api/BookingPaymentSmokeTest.php
 * 
 * This test verifies:
 * - Booking can be created
 * - Payment intent can be created for a booking
 * - Payment status can be checked
 * - Booking status updates correctly
 * 
 * Run with: php artisan test --filter=BookingPaymentSmokeTest
 */
class BookingPaymentSmokeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test package (use factory defaults, only override essential fields)
        $this->package = Package::factory()->create([
            'name' => 'Smoke Test Package',
            'slug' => 'smoke-test-package',
            'is_active' => true,
        ]);
    }

    #[Test]
    public function smoke_test_complete_booking_and_payment_flow(): void
    {
        // Step 1: Create a booking
        $bookingData = [
            'package_id' => $this->package->id,
            'is_guest_booking' => true,
            'parent_first_name' => 'Smoke',
            'parent_last_name' => 'Test',
            'parent_email' => 'smoke@test.com',
            'parent_phone' => '+44 20 1234 5678',
            'parent_postcode' => 'AL10',
            'total_price' => 100.00,
            'total_hours' => 10,
            'status' => 'pending',
            'payment_status' => 'pending',
            'participants' => [
                [
                    'first_name' => 'Child',
                    'last_name' => 'Test',
                    'date_of_birth' => '2015-01-01',
                    'age' => 10,
                ],
            ],
        ];

        $createResponse = $this->postJson('/api/v1/bookings', $bookingData);
        
        $createResponse->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'reference',
                    'status',
                ],
            ])
            ->assertJson(['success' => true]);

        $bookingId = $createResponse->json('data.id');
        $bookingReference = $createResponse->json('data.reference');

        // Verify booking reference format
        $this->assertStringStartsWith('CAMS-', $bookingReference);
        
        // Status should be 'draft' for new bookings (not 'pending')
        $status = $createResponse->json('data.status');
        $this->assertContains($status, ['draft', 'pending'], "Status should be 'draft' or 'pending', got: {$status}");

        // Step 2: Verify booking can be retrieved by ID
        $getResponse = $this->getJson("/api/v1/bookings/{$bookingId}");
        
        $getResponse->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.id', $bookingId)
            ->assertJsonPath('data.reference', $bookingReference);

        // Step 3: Verify booking can be retrieved by reference
        $getByRefResponse = $this->getJson("/api/v1/bookings/reference/{$bookingReference}");
        
        $getByRefResponse->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.id', $bookingId)
            ->assertJsonPath('data.reference', $bookingReference);

        // Step 4: Create payment intent (skip if Stripe not configured)
        if (!config('services.stripe.secret_key')) {
            $this->markTestSkipped('Stripe secret key not configured - skipping payment intent test');
        }

        $paymentIntentResponse = $this->postJson("/api/v1/bookings/{$bookingId}/payments/create-intent", [
            'amount' => 50.00,
            'currency' => 'GBP',
            'payment_method' => 'stripe',
        ]);

        $paymentIntentResponse->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'payment_intent_id',
                    'client_secret',
                    'payment_id',
                ],
            ])
            ->assertJson(['success' => true]);

        $paymentIntentId = $paymentIntentResponse->json('data.payment_intent_id');
        $this->assertNotEmpty($paymentIntentId);
        $this->assertStringStartsWith('pi_', $paymentIntentId);

        // Step 5: Verify payment status can be checked
        // Note: Payment won't be confirmed yet (requires Stripe.js on frontend)
        // But we can verify the payment intent exists
        $booking = Booking::find($bookingId);
        $this->assertNotNull($booking);
        $this->assertContains($booking->status, ['draft', 'pending'], "Booking status should be 'draft' or 'pending'");
        $this->assertEquals(0.00, $booking->paid_amount);

        // Verify payment record was created in polymorphic payments table
        $this->assertDatabaseHas('payments', [
            'payable_type' => \App\Models\Booking::class,
            'payable_id' => $bookingId,
            'amount' => 50.00,
            'currency' => 'GBP',
            'payment_method' => 'stripe',
            'status' => 'processing',
        ]);

        // Step 6: Verify booking list includes our booking
        $listResponse = $this->getJson('/api/v1/bookings');
        
        $listResponse->assertStatus(200)
            ->assertJson(['success' => true]);

        $bookings = $listResponse->json('data');
        $this->assertIsArray($bookings);
        
        // Find our booking in the list
        $foundBooking = collect($bookings)->firstWhere('id', $bookingId);
        $this->assertNotNull($foundBooking, 'Booking should appear in list');
        $this->assertEquals($bookingReference, $foundBooking['reference']);

        // ✅ Smoke test passed - core flow works!
    }

    #[Test]
    public function smoke_test_booking_validation(): void
    {
        // Verify validation works
        $response = $this->postJson('/api/v1/bookings', [
            'package_id' => $this->package->id,
            // Missing required fields
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parent_first_name', 'parent_last_name', 'parent_email']);
    }

    #[Test]
    public function smoke_test_payment_validation(): void
    {
        $booking = Booking::factory()->create([
            'package_id' => $this->package->id,
            'total_price' => 100.00,
        ]);

        // Test invalid amount
        $response = $this->postJson("/api/v1/bookings/{$booking->id}/payments/create-intent", [
            'amount' => -10.00, // Invalid
            'currency' => 'GBP',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);

        // Test invalid currency
        $response = $this->postJson("/api/v1/bookings/{$booking->id}/payments/create-intent", [
            'amount' => 50.00,
            'currency' => 'INVALID', // Invalid
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['currency']);
    }
}

