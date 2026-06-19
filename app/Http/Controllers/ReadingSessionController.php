<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckInRequest;
use App\Http\Requests\CheckOutRequest;
use App\Http\Resources\ReadingSessionResource;
use App\Models\ReadingSession;
use App\Models\Setting;
use App\Services\ReadingSessionService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReadingSessionController extends Controller
{
    private ReadingSessionService $service;

    public function __construct(ReadingSessionService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $query = ReadingSession::query();

        if ($request->has('date')) {
            $query->whereDate('check_in_at', $request->date);
        } else {
            // default to today
            $query->whereDate('check_in_at', Carbon::today());
        }

        return ReadingSessionResource::collection($query->orderBy('created_at', 'desc')->get());
    }

    public function activeSessions()
    {
        $sessions = $this->service->getActiveSessions();
        return ReadingSessionResource::collection($sessions);
    }

    public function checkIn(CheckInRequest $request)
    {
        try {
            $session = $this->service->checkIn($request->validated());
            return response()->json(new ReadingSessionResource($session), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function checkOut(CheckOutRequest $request, int $id)
    {
        try {
            $session = $this->service->checkOut($id, $request->payment_method);
            return response()->json(new ReadingSessionResource($session));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function cancel(int $id)
    {
        try {
            $session = $this->service->cancel($id);
            return response()->json(new ReadingSessionResource($session));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function liveAmount(int $id)
    {
        $session = ReadingSession::findOrFail($id);
        $liveData = $this->service->calculateLiveAmount($session);
        return response()->json($liveData);
    }

    public function dailySummary(Request $request)
    {
        $date = $request->has('date') ? Carbon::parse($request->date) : Carbon::today();
        $summary = $this->service->getDailySummary($date);
        return response()->json($summary);
    }

    public function getLayout()
    {
        $layoutSetting = Setting::where('key', 'lounge_layout')->first();
        $rateSetting = Setting::where('key', 'hourly_rate')->first();

        return response()->json([
            'layout' => $layoutSetting ? $layoutSetting->value : [],
            'hourly_rate' => $rateSetting ? (float) $rateSetting->value : 350.00,
        ]);
    }

    public function saveLayout(Request $request)
    {
        $validated = $request->validate([
            'layout' => 'required|array',
            'layout.*.id' => 'required|string',
            'layout.*.label' => 'required|string',
            'layout.*.seats' => 'required|integer|min:1|max:20',
            'hourly_rate' => 'required|numeric|min:1|max:100000',
        ]);

        // Validation against active sessions
        $activeSessions = ReadingSession::active()->get();
        $occupiedSeats = $activeSessions->pluck('seat_number')->toArray();

        // Build valid seat IDs from the new layout
        $newValidSeats = [];
        foreach ($validated['layout'] as $table) {
            $tableId = $table['id'];
            $seatCount = $table['seats'];
            // Reconstruct seat IDs assuming they are letters A, B, C...
            // or just count. In InteractiveSeatMap, it's A, B, C... we need up to Z.
            $letters = range('A', 'Z');
            for ($i = 0; $i < $seatCount; $i++) {
                $seatLetter = $letters[$i];
                $newValidSeats[] = "{$tableId}-{$seatLetter}";
            }
        }

        // Check if any occupied seat is missing from the new layout
        foreach ($occupiedSeats as $seatId) {
            if (!in_array(strtoupper($seatId), $newValidSeats)) {
                return response()->json([
                    'message' => "Cannot save layout. Seat {$seatId} is currently occupied by an active session."
                ], 400);
            }
        }

        $setting = Setting::updateOrCreate(
            ['key' => 'lounge_layout'],
            ['value' => $validated['layout']]
        );

        Setting::updateOrCreate(
            ['key' => 'hourly_rate'],
            ['value' => $validated['hourly_rate']]
        );

        return response()->json(['message' => 'Layout saved successfully', 'layout' => $setting->value]);
    }
}