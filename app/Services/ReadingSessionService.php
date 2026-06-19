<?php

namespace App\Services;

use App\Models\ReadingSession;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class ReadingSessionService
{
    /**
     * Retrieve the configured hourly rate, falling back to 350.00.
     */
    private function getHourlyRate(): float
    {
        $setting = Setting::where('key', 'hourly_rate')->first();
        return $setting ? (float) $setting->value : 350.00;
    }

    /**
     * Check in a new reading session.
     */
    public function checkIn(array $data): ReadingSession
    {
        // Check if seat is already occupied
        if (ReadingSession::active()->where('seat_number', $data['seat_number'])->exists()) {
            throw new \Exception('Seat is already occupied.');
        }

        return ReadingSession::create([
            'customer_name' => $data['customer_name'] ?? null,
            'seat_number' => $data['seat_number'],
            'check_in_at' => now(),
            'hourly_rate' => isset($data['hourly_rate']) ? (float) $data['hourly_rate'] : $this->getHourlyRate(),
            'status' => 'active',
            'served_by' => $data['served_by'],
        ]);
    }

    /**
     * Check out a session.
     */
    public function checkOut(int $sessionId, string $paymentMethod): ReadingSession
    {
        $session = ReadingSession::findOrFail($sessionId);

        if ($session->status !== 'active') {
            throw new \Exception('Session is not active.');
        }

        $checkOutTime = now();
        $durationMinutes = (int) $session->check_in_at->diffInMinutes($checkOutTime);

        // Ensure at least 1 minute is recorded if checkout is super fast
        if ($durationMinutes < 1) {
            $durationMinutes = 1;
        }

        $billedUnits = $this->calculateBilledUnits($durationMinutes);
        $totalAmount = $billedUnits * $session->hourly_rate;

        $session->update([
            'check_out_at' => $checkOutTime,
            'duration_minutes' => $durationMinutes,
            'billed_units' => $billedUnits,
            'total_amount' => $totalAmount,
            'payment_method' => $paymentMethod,
            'status' => 'completed',
        ]);

        return $session;
    }

    /**
     * Cancel an active session.
     * Use case: customer leaves immediately and no charge is required.
     */
    public function cancel(int $sessionId): ReadingSession
    {
        $session = ReadingSession::findOrFail($sessionId);

        if ($session->status !== 'active') {
            throw new \Exception('Session is not active and cannot be cancelled.');
        }

        $session->update([
            'check_out_at' => now(),
            'duration_minutes' => 0,
            'billed_units' => 0,
            'total_amount' => 0,
            'status' => 'cancelled',
        ]);

        return $session;
    }

    /**
     * Calculate 0.5-hour rounding up rule.
     */
    public function calculateBilledUnits(int $minutes): float
    {
        if ($minutes <= 0) {
            return 0.5;
        }

        if ($minutes <= 30) {
            return 0.5;
        }

        return ceil($minutes / 30) * 0.5;
    }

    /**
     * Return live calculation data for frontend.
     */
    public function calculateLiveAmount(ReadingSession $session): array
    {
        if ($session->status !== 'active') {
            return [
                'minutes_elapsed' => $session->duration_minutes,
                'billed_units' => $session->billed_units,
                'running_total' => $session->total_amount,
                'check_in_at' => $session->check_in_at->toIso8601String(),
            ];
        }

        $minutesElapsed = (int) $session->check_in_at->diffInMinutes(now());
        if ($minutesElapsed < 1) {
            $minutesElapsed = 1; // display at least 1 min to prevent 0 units if they just sat down
        }
        $billedUnits = $this->calculateBilledUnits($minutesElapsed);
        $runningTotal = $billedUnits * $session->hourly_rate;

        return [
            'minutes_elapsed' => $minutesElapsed,
            'billed_units' => $billedUnits,
            'running_total' => $runningTotal,
            'check_in_at' => $session->check_in_at->toIso8601String(),
        ];
    }

    /**
     * Get all currently active sessions with live running totals.
     */
    public function getActiveSessions(): Collection
    {
        $sessions = ReadingSession::active()->get();

        $sessions->each(function ($session) {
            $liveData = $this->calculateLiveAmount($session);
            $session->minutes_elapsed = $liveData['minutes_elapsed'];
            $session->billed_units = $liveData['billed_units'];
            $session->running_total = $liveData['running_total'];
        });

        return $sessions;
    }

    /**
     * Get daily summary.
     */
    public function getDailySummary(Carbon $date): array
    {
        $sessions = ReadingSession::whereDate('check_in_at', $date)
            ->where('status', 'completed')
            ->get();

        $totalSessions = $sessions->count();
        $totalRevenue = $sessions->sum('total_amount');
        $avgDuration = $totalSessions > 0 ? $sessions->avg('duration_minutes') : 0;

        return [
            'total_sessions' => $totalSessions,
            'total_revenue' => $totalRevenue,
            'average_duration_minutes' => round($avgDuration),
        ];
    }
}