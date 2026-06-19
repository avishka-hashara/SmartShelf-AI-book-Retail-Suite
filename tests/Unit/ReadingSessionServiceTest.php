<?php

namespace Tests\Unit;

use Tests\TestCase; // Must use Laravel's TestCase, not PHPUnit directly, to use RefreshDatabase
use App\Models\ReadingSession;
use App\Services\ReadingSessionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class ReadingSessionServiceTest extends TestCase
{
    use RefreshDatabase;

    private ReadingSessionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReadingSessionService();
    }

    private function createSession(int $minutesAgo): ReadingSession
    {
        return ReadingSession::create([
            'customer_name' => 'Test User',
            'seat_number' => 'SEAT-01',
            'check_in_at' => Carbon::now()->subMinutes($minutesAgo),
            'hourly_rate' => 350,
            'status' => 'active',
            'served_by' => 'Admin'
        ]);
    }

    public function test_30_minutes_billed_as_half_hour()
    {
        $session = $this->createSession(30);
        $completed = $this->service->checkOut($session->id, 'cash');

        $this->assertEquals(0.5, $completed->billed_units);
        $this->assertEquals(175, $completed->total_amount);
    }

    public function test_31_minutes_billed_as_one_hour()
    {
        $session = $this->createSession(31);
        $completed = $this->service->checkOut($session->id, 'cash');

        $this->assertEquals(1.0, $completed->billed_units);
        $this->assertEquals(350, $completed->total_amount);
    }

    public function test_60_minutes_billed_as_one_hour()
    {
        $session = $this->createSession(60);
        $completed = $this->service->checkOut($session->id, 'cash');

        $this->assertEquals(1.0, $completed->billed_units);
        $this->assertEquals(350, $completed->total_amount);
    }

    public function test_61_minutes_billed_as_one_and_half_hours()
    {
        $session = $this->createSession(61);
        $completed = $this->service->checkOut($session->id, 'cash');

        $this->assertEquals(1.5, $completed->billed_units);
        $this->assertEquals(525, $completed->total_amount);
    }

    public function test_90_minutes_billed_as_one_and_half_hours()
    {
        $session = $this->createSession(90);
        $completed = $this->service->checkOut($session->id, 'cash');

        $this->assertEquals(1.5, $completed->billed_units);
        $this->assertEquals(525, $completed->total_amount);
    }

    public function test_91_minutes_billed_as_two_hours()
    {
        $session = $this->createSession(91);
        $completed = $this->service->checkOut($session->id, 'cash');

        $this->assertEquals(2.0, $completed->billed_units);
        $this->assertEquals(700, $completed->total_amount);
    }

    public function test_105_minutes_billed_as_two_hours()
    {
        $session = $this->createSession(105);
        $completed = $this->service->checkOut($session->id, 'cash');

        $this->assertEquals(2.0, $completed->billed_units);
        $this->assertEquals(700, $completed->total_amount);
    }

    public function test_1_minute_billed_as_half_hour()
    {
        $session = $this->createSession(1);
        $completed = $this->service->checkOut($session->id, 'cash');

        $this->assertEquals(0.5, $completed->billed_units);
        $this->assertEquals(175, $completed->total_amount);
    }

    public function test_check_in_creates_active_session()
    {
        $data = [
            'customer_name' => 'John Doe',
            'seat_number' => 'SEAT-TEST',
            'served_by' => 'Admin'
        ];

        $session = $this->service->checkIn($data);

        $this->assertInstanceOf(ReadingSession::class, $session);
        $this->assertEquals('SEAT-TEST', $session->seat_number);
        $this->assertEquals('active', $session->status);
        $this->assertDatabaseHas('reading_sessions', ['seat_number' => 'SEAT-TEST', 'status' => 'active']);
    }

    public function test_check_out_completes_session()
    {
        $session = $this->createSession(10);

        $completed = $this->service->checkOut($session->id, 'card');

        $this->assertEquals('completed', $completed->status);
        $this->assertEquals('card', $completed->payment_method);
        $this->assertNotNull($completed->check_out_at);
        $this->assertNotNull($completed->duration_minutes);
    }

    public function test_check_out_calculates_correct_duration()
    {
        $session = $this->createSession(45);

        $completed = $this->service->checkOut($session->id, 'cash');

        $this->assertEquals(45, $completed->duration_minutes);
    }

    public function test_daily_summary_returns_correct_totals()
    {
        // Create two completed sessions for today
        $session1 = $this->createSession(120);
        $this->service->checkOut($session1->id, 'cash'); // 2 hours = 700

        $session2 = $this->createSession(60);
        $this->service->checkOut($session2->id, 'card'); // 1 hour = 350

        // Ensure duration passes at checkout
        $summary = $this->service->getDailySummary(Carbon::today());

        $this->assertEquals(2, $summary['total_sessions']);
        $this->assertEquals(1050, $summary['total_revenue']);
        $this->assertEquals(90, $summary['average_duration_minutes']); // (120+60)/2
    }
}
