<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ReadingSession;
use Carbon\Carbon;

class ReadingSessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 2 Active Sessions
        ReadingSession::create([
            'customer_name' => 'Sarah Jenkins',
            'seat_number' => 'SEAT-04',
            'check_in_at' => Carbon::now()->subMinutes(45)->subSeconds(12),
            'hourly_rate' => 350,
            'status' => 'active',
            'served_by' => 'Admin'
        ]);

        ReadingSession::create([
            'customer_name' => null, // Anonymous
            'seat_number' => 'SEAT-08',
            'check_in_at' => Carbon::now()->subHours(2)->subMinutes(5),
            'hourly_rate' => 350,
            'status' => 'active',
            'served_by' => 'Cashier 1'
        ]);

        // Create 3 Completed Sessions for Today's Summary
        ReadingSession::create([
            'customer_name' => 'Emma Watson',
            'seat_number' => 'SEAT-12',
            'check_in_at' => Carbon::now()->subHours(4),
            'check_out_at' => Carbon::now()->subHours(3), // 1 hour duration
            'duration_minutes' => 60,
            'billed_units' => 1.0,
            'hourly_rate' => 350,
            'total_amount' => 350,
            'payment_method' => 'cash',
            'status' => 'completed',
            'served_by' => 'Admin'
        ]);

        ReadingSession::create([
            'customer_name' => 'David Miller',
            'seat_number' => 'SEAT-01',
            'check_in_at' => Carbon::now()->subHours(6),
            'check_out_at' => Carbon::now()->subHours(4)->subMinutes(15), // 1 hr 45 min duration
            'duration_minutes' => 105,
            'billed_units' => 2.0,
            'hourly_rate' => 350,
            'total_amount' => 700,
            'payment_method' => 'card',
            'status' => 'completed',
            'served_by' => 'Cashier 2'
        ]);

        ReadingSession::create([
            'customer_name' => 'Sophie Turner',
            'seat_number' => 'SEAT-15',
            'check_in_at' => Carbon::now()->subHours(8),
            'check_out_at' => Carbon::now()->subHours(7)->subMinutes(50), // 10 min duration
            'duration_minutes' => 10,
            'billed_units' => 0.5,
            'hourly_rate' => 350,
            'total_amount' => 175,
            'payment_method' => 'cash',
            'status' => 'completed',
            'served_by' => 'Admin'
        ]);
    }
}
