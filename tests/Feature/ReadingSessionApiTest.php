<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\ReadingSession;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReadingSessionApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        // Since it's protected by auth middleware, we need an authenticated user
        $this->user = User::factory()->create();
    }

    public function test_checkin_api_returns_201_with_session()
    {
        $response = $this->actingAs($this->user)->postJson('/api/reading/sessions/check-in', [
            'customer_name' => 'Alice',
            'seat_number' => 'SEAT-10',
            'served_by' => 'Admin'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'customer_name', 'seat_number', 'status'])
            ->assertJsonPath('status', 'active');
    }

    public function test_checkout_api_returns_completed_session_with_total()
    {
        $session = ReadingSession::create([
            'customer_name' => 'Bob',
            'seat_number' => 'SEAT-11',
            'check_in_at' => now()->subMinutes(65),
            'hourly_rate' => 350,
            'status' => 'active',
            'served_by' => 'Admin'
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/reading/sessions/{$session->id}/check-out", [
            'payment_method' => 'card'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'completed')
            ->assertJsonPath('total_amount', '525.00')
            ->assertJsonPath('billed_units', '1.5')
            ->assertJsonPath('payment_method', 'card');
    }

    public function test_live_amount_api_returns_running_total()
    {
        $session = ReadingSession::create([
            'customer_name' => 'Charlie',
            'seat_number' => 'SEAT-12',
            'check_in_at' => now()->subMinutes(35),
            'hourly_rate' => 350,
            'status' => 'active',
            'served_by' => 'Admin'
        ]);

        $response = $this->actingAs($this->user)->getJson("/api/reading/sessions/{$session->id}/live");

        $response->assertStatus(200)
            ->assertJsonPath('minutes_elapsed', 35)
            ->assertJsonPath('billed_units', 1)
            ->assertJsonPath('running_total', 350);
    }

    public function test_active_sessions_api_returns_only_active()
    {
        // 1 active
        ReadingSession::create([
            'customer_name' => 'Dave',
            'seat_number' => 'SEAT-13',
            'check_in_at' => now(),
            'hourly_rate' => 350,
            'status' => 'active',
            'served_by' => 'Admin'
        ]);

        // 1 completed
        ReadingSession::create([
            'customer_name' => 'Eve',
            'seat_number' => 'SEAT-14',
            'check_in_at' => now()->subHours(1),
            'check_out_at' => now(),
            'duration_minutes' => 60,
            'billed_units' => 1.0,
            'total_amount' => 350,
            'hourly_rate' => 350,
            'status' => 'completed',
            'served_by' => 'Admin'
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/reading/sessions/active');

        $response->assertStatus(200)
            ->assertJsonCount(1); // Should only return Dave's session
    }

    public function test_anonymous_checkin_allowed()
    {
        $response = $this->actingAs($this->user)->postJson('/api/reading/sessions/check-in', [
            'seat_number' => 'SEAT-15',
            'served_by' => 'Admin'
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('customer_name', 'Guest') // Defaulted in resource or null
            ->assertJsonPath('status', 'active');
    }
}
