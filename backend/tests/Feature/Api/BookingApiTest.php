<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Booking API Endpoint Tests
 * 
 * Tests all booking API endpoints:
 * - GET /api/v1/bookings (list)
 * - GET /api/v1/bookings/{id} (by ID)
 * - GET /api/v1/bookings/reference/{reference} (by reference)
 * - POST /api/v1/bookings (create)
 * - PUT /api/v1/bookings/{id} (update)
 * - POST /api/v1/bookings/{id}/cancel (cancel)
 */
class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test data
        $this->package = Package::factory()->create();
        $this->user = User::factory()->create();
    }

    #[Test]
    public function it_can_list_bookings(): void
    {
        Booking::factory()->count(3)->create([
            'package_id' => $this->package->id,
        ]);

        $response = $this->getJson('/api/v1/bookings');

        // Debug: show error if not 200
        if ($response->status() !== 200) {
            $this->fail('Expected 200 but got ' . $response->status() . ': ' . json_encode($response->json(), JSON_PRETTY_PRINT));
        }

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'reference',
                        'packageId',
                        'status',
                        'paymentStatus',
                    ],
                ],
                'meta',
            ])
            ->assertJson(['success' => true]);
    }

    #[Test]
    public function it_can_get_booking_by_id(): void
    {
        $booking = Booking::factory()->create([
            'package_id' => $this->package->id,
        ]);

        $response = $this->getJson("/api/v1/bookings/{$booking->id}");

        // Debug: show error if not 200
        if ($response->status() !== 200) {
            $this->fail('Expected 200 but got ' . $response->status() . ': ' . json_encode($response->json(), JSON_PRETTY_PRINT));
        }

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'reference',
                    'packageId',
                    'package',
                    'status',
                    'paymentStatus',
                    'participants',
                    'schedules',
                    'payments',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => (string) $booking->id,
                ],
            ]);
    }

    #[Test]
    public function it_can_get_booking_by_reference(): void
    {
        $booking = Booking::factory()->create([
            'package_id' => $this->package->id,
            'reference' => 'CAMS-TEST-GEN-0001',
        ]);

        $response = $this->getJson('/api/v1/bookings/reference/CAMS-TEST-GEN-0001');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'reference' => 'CAMS-TEST-GEN-0001',
                ],
            ]);
    }

    #[Test]
    public function it_can_create_booking(): void
    {
        $data = [
            'package_id' => $this->package->id,
            'is_guest_booking' => true,
            'parent_first_name' => 'John',
            'parent_last_name' => 'Doe',
            'parent_email' => 'john.doe@example.com',
            'parent_phone' => '+44 20 1234 5678',
            'parent_postcode' => 'AL10',
            'total_price' => 100.00,
            'total_hours' => 10,
            'status' => 'pending',
            'payment_status' => 'pending',
            'participants' => [
                [
                    'first_name' => 'Jane',
                    'last_name' => 'Doe',
                    'date_of_birth' => '2015-05-15',
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/bookings', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'reference',
                    'packageId',
                ],
                'message',
            ])
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('bookings', [
            'parent_email' => 'john.doe@example.com',
            'package_id' => $this->package->id,
        ]);
    }

    #[Test]
    public function it_can_update_booking(): void
    {
        $booking = Booking::factory()->create([
            'package_id' => $this->package->id,
            'status' => 'pending',
        ]);

        $data = [
            'status' => 'confirmed',
            'notes' => 'Updated booking',
        ];

        $response = $this->putJson("/api/v1/bookings/{$booking->id}", $data);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
        ]);
    }

    #[Test]
    public function it_can_cancel_booking(): void
    {
        $booking = Booking::factory()->create([
            'package_id' => $this->package->id,
            'status' => 'confirmed',
        ]);

        $response = $this->postJson("/api/v1/bookings/{$booking->id}/cancel", [
            'reason' => 'Customer requested cancellation',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'cancelled',
        ]);
    }

    #[Test]
    public function it_returns_404_for_nonexistent_booking(): void
    {
        $response = $this->getJson('/api/v1/bookings/99999');

        // Debug: show actual response if not 404
        if ($response->status() !== 404) {
            dump($response->json());
        }

        $response->assertStatus(404)
            ->assertJson(['success' => false]);
    }

    #[Test]
    public function it_validates_required_fields_when_creating_booking(): void
    {
        $response = $this->postJson('/api/v1/bookings', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['package_id', 'parent_first_name', 'parent_last_name', 'parent_email']);
    }
}


