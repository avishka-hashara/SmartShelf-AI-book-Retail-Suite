<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ReadingSession;
use App\Models\User;
use App\Models\AppNotification;
use App\Services\AI\OpenRouterService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SendDailyDigest extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pos:daily-digest';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send AI-generated daily business digest to admin users';

    /**
     * Create a new command instance.
     */
    public function __construct(private OpenRouterService $ai)
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();

        $totalSales = Order::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->sum('total');

        $txnCount = Order::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->count();

        $topProductRow = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
            ->whereDate('order_items.created_at', $today)
            ->select('products.name', DB::raw('SUM(order_items.qty) as total_qty'))
            ->groupBy('order_items.product_id', 'products.name')
            ->orderByDesc('total_qty')
            ->first();

        $topProduct = $topProductRow ? $topProductRow->name : 'N/A';

        $lowStockCount = Product::where('stock_level', '<=', 5)->count();

        $loungeRevenue = ReadingSession::whereDate('created_at', $today)
            ->sum('total_amount');

        $systemPrompt = "You are a business intelligence assistant for a retail store with a reading lounge in Sri Lanka. Write a friendly, encouraging end-of-day summary for the store owner in 3-4 sentences. Include specific numbers. End with one forward-looking tip for tomorrow. Plain text, no markdown.";

        $userPrompt = "Today's performance:\n"
            . "- Sales total: LKR {$totalSales}\n"
            . "- Transactions: {$txnCount}\n"
            . "- Top selling product: {$topProduct}\n"
            . "- Low stock items: {$lowStockCount} products need reordering\n"
            . "- Reading lounge revenue: LKR {$loungeRevenue}\n"
            . "Write the daily digest.";

        $digestText = $this->ai->chat($systemPrompt, $userPrompt);

        if (empty($digestText)) {
            $digestText = "Today's sales: LKR {$totalSales} across {$txnCount} transactions. Check low stock items ({$lowStockCount} products). Review tomorrow's inventory.";
        }

        $admins = User::whereIn('role', ['admin', 'manager'])->get();

        foreach ($admins as $user) {
            $notification = new AppNotification([
                'type' => 'daily_digest',
                'title' => "Daily Digest — " . now()->format('D, d M Y'),
                'message' => $digestText,
                'data' => [
                    'action_url' => '/reports',
                    'user_id' => $user->id
                ],
                'read_at' => null,
            ]);
            $notification->save();
        }

        $this->info("Digest sent to {$admins->count()} users.");
    }
}
