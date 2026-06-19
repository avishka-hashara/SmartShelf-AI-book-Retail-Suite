<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = AppNotification::latest()->limit(50)->get();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => AppNotification::unread()->count(),
        ]);
    }

    public function markAllRead(): JsonResponse
    {
        AppNotification::unread()->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function clear(): JsonResponse
    {
        AppNotification::query()->delete();

        return response()->json(['message' => 'Notifications cleared.']);
    }
}
