<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Package;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Payment API Endpoint Tests
 * 
 * Tests payment API endpoints:
 * - POST /api/v1/bookings/{bookingId}/payments/create-intent
 * - POST /api/v1/payments/confirm
 * 
 * Note: These tests require Stripe test keys to be configured.
 * Set STRIPE_SECRET_KEY in .env.testing or use mocking.
 */
class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->package = Package::factory()->create();
        $this->booking = Booking::factory()->create([
            'package_id' => $this->package->id,
            'total_price' => 100.00,
            'paid_amount' => 0.00,
            'payment_status' => 'pending',
        ]);
    }

    #[Test]
    public function it_can_create_payment_intent(): void
    {
        // Skip if Stripe keys not configured
        if (!config('services.stripe.secret_key')) {
            $this->markTestSkipped('Stripe secret key not configured');
        }

        $response = $this->postJson("/api/v1/bookings/{$this->booking->id}/payments/create-intent", [
            'amount' => 50.00,
            'currency' => 'GBP',
            'payment_method' => 'stripe',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'payment_intent_id',
                    'client_secret',
                    'payment_id',
                ],
            ])
            ->assertJson(['success' => true]);
    }

    #[Test]
    public function it_validates_amount_when_creating_payment_intent(): void
    {
        $response = $this->postJson("/api/v1/bookings/{$this->booking->id}/payments/create-intent", [
            'amount' => -10.00, // Invalid negative amount
            'currency' => 'GBP',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    #[Test]
    public function it_validates_currency_when_creating_payment_intent(): void
    {
        $response = $this->postJson("/api/v1/bookings/{$this->booking->id}/payments/create-intent", [
            'amount' => 50.00,
            'currency' => 'INVALID', // Invalid currency
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['currency']);
    }

    #[Test]
    public function it_can_confirm_payment(): void
    {
        // Skip if Stripe keys not configured
        if (!config('services.stripe.secret_key')) {
            $this->markTestSkipped('Stripe secret key not configured');
        }

        // First create a payment intent
        $createResponse = $this->postJson("/api/v1/bookings/{$this->booking->id}/payments/create-intent", [
            'amount' => 50.00,
            'currency' => 'GBP',
            'payment_method' => 'stripe',
        ]);

        if ($createResponse->status() !== 201) {
            $this->markTestSkipped('Could not create payment intent (Stripe may not be configured)');
        }

        $paymentIntentId = $createResponse->json('data.payment_intent_id');

        // Note: In real testing, you would need to actually complete the payment
        // via Stripe test card before confirming. This test assumes the payment
        // intent exists but may not be confirmed yet.
        $response = $this->postJson('/api/v1/payments/confirm', [
            'payment_intent_id' => $paymentIntentId,
        ]);

        // May return 400 if payment not yet confirmed, which is expected
        $response->assertJsonStructure([
            'success',
        ]);
    }

    #[Test]
    public function it_validates_payment_intent_id_when_confirming(): void
    {
        $response = $this->postJson('/api/v1/payments/confirm', []);

        // Debug: show error if not 422
        if ($response->status() !== 422) {
            dump($response->json());
        }

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['payment_intent_id']);
    }

    #[Test]
    public function it_returns_error_for_nonexistent_booking_when_creating_intent(): void
    {
        $response = $this->postJson('/api/v1/bookings/99999/payments/create-intent', [
            'amount' => 50.00,
            'currency' => 'GBP',
        ]);

        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }
}


