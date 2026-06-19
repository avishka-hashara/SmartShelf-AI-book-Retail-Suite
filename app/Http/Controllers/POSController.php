<?php

// app/Http/Controllers/POSController.php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\StoreSettings;
use App\Services\NotificationService;
use App\Services\ProductService;
use Inertia\Inertia;
use Inertia\Response;

use Illuminate\Http\Request;

class POSController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
        private readonly NotificationService $notificationService
    ) {
    }

    public function index(): Response
    {
        /* ── Products ── */
        $products = Product::orderBy('name')
            ->get()
            ->map(fn (Product $p) => [
                'id'        => $p->id,
                'name'      => $p->name,
                'brand'     => $p->brand,
                'sku'       => $p->sku,
                'category'  => $p->category,
                'price'     => (float) $p->unit_price,
                'stock'     => (int)   $p->stock_level,
                'status'    => $p->status,
                // Raw DB path e.g. "products/photo.jpg"
                // Frontend builds: `/storage/products/photo.jpg`
                // Exactly like employee avatars: `/storage/${employee.avatar}`
                'imagePath' => $p->image_path,
            ]);

        /* ── Customers ── */
        $customers = Customer::where('status', 'Active')
            ->orderBy('name')
            ->get()
            ->map(fn (Customer $c) => [
                'id'         => $c->id,
                'name'       => $c->name,
                'phone'      => $c->phone,
                'email'      => $c->email,
                'visits'     => (int)   $c->orders,
                'totalSpent' => (float) $c->total_purchases,
                'loyaltyPts' => (int)   $c->loyalty_pts,
            ]);

        /* ── Dynamic category list ── */
        $dbCategories = Product::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->map(fn ($cat) => [
                'value' => $cat,
                'label' => ucwords(str_replace('_', ' ', $cat)),
            ])
            ->toArray();

        $categories = array_merge(
            [['value' => 'all', 'label' => 'All']],
            $dbCategories
        );

        /* ── Active Promotions ── */
        $promotions = Promotion::with('products')
            ->active()
            ->orderBy('priority', 'desc')
            ->get()
            ->map(fn (Promotion $promo) => [
                'id'             => $promo->id,
                'name'           => $promo->name,
                'description'    => $promo->description,
                'type'           => $promo->type,
                'discount_type'  => $promo->discount_type,
                'discount_value' => (float) $promo->discount_value,
                'original_price' => (float) $promo->original_price,
                'final_price'    => (float) $promo->final_price,
                'savings'        => (float) $promo->savings,
                'promo_code'     => $promo->promo_code,
                'image_path'     => $promo->image_path,
                'products'       => $promo->products->map(fn ($p) => [
                    'id'        => $p->id,
                    'name'      => $p->name,
                    'brand'     => $p->brand,
                    'sku'       => $p->sku,
                    'price'     => (float) $p->unit_price,
                    'stock'     => (int) $p->stock_level,
                    'quantity'  => $p->pivot->quantity,
                    'imagePath' => $p->image_path,
                ]),
            ]);

        return Inertia::render('POS/POSTerminal', [
            'products'   => $products,
            'customers'  => $customers,
            'categories' => $categories,
            'promotions' => $promotions,
            'settings'   => StoreSettings::instance(),
        ]);
    }

    public function getInvoice($order_number)
    {
        $order = \App\Models\Order::with(['items', 'customer'])
            ->where('order_number', $order_number)
            ->orWhere('notes', 'LIKE', "%{$order_number}%")
            ->first();
            
        if (!$order) {
            return response()->json(['error' => 'Invoice not found'], 404);
        }
        return response()->json(['order' => $order->toFrontend()]);
    }

    public function processRefund(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:order_items,id',
            'items.*.qty_refunded' => 'required|integer|min:1',
            'items.*.return_to_stock' => 'required|boolean',
        ]);

        $order = \App\Models\Order::with('items')->findOrFail($request->order_id);
        
        $refundAmount = 0;
        $processedItems = [];

        foreach ($request->items as $refundItem) {
            $orderItem = $order->items->where('id', $refundItem['id'])->first();
            if (!$orderItem) {
                continue;
            }

            if ($refundItem['qty_refunded'] > $orderItem->qty) {
                return response()->json(['error' => "Cannot refund more than purchased quantity for {$orderItem->title}."], 422);
            }

            $lineRefund = $orderItem->unit_price * $refundItem['qty_refunded'];
            $refundAmount += $lineRefund;

            // Deduct from original order item
            $orderItem->decrement('qty', $refundItem['qty_refunded']);
            $orderItem->decrement('subtotal', $lineRefund);

            if ($refundItem['return_to_stock'] && $orderItem->product_id) {
                $this->productService->adjustStock(
                    $orderItem->product_id,
                    $refundItem['qty_refunded'],
                    "POS refund — Invoice {$order->order_number}",
                    'return',
                    'order',
                    $order->id
                );
            } else {
                // Record as waste if not returned to stock
                \App\Models\WastedItem::create([
                    'product_id' => $orderItem->product_id,
                    'order_id' => $order->id,
                    'qty' => $refundItem['qty_refunded'],
                    'unit_price' => $orderItem->unit_price,
                    'total_loss' => $lineRefund,
                    'reason' => 'Refund Waste — Invoice ' . $order->orderId
                ]);

                if ($orderItem->product_id) {
                    \App\Models\StockMovement::create([
                        'product_id'     => $orderItem->product_id,
                        'type'           => 'waste',
                        'quantity'       => 0, // stock_level unchanged — item discarded, not restocked
                        'reason'         => "POS refund waste — Invoice {$order->order_number}",
                        'reference_type' => 'order',
                        'reference_id'   => $order->id,
                        'user_id'        => auth()->id(),
                    ]);
                }
            }

            $processedItems[] = [
                'id' => $orderItem->id,
                'name' => $orderItem->title,
                'price' => $orderItem->unit_price,
                'qty' => $refundItem['qty_refunded'],
                'subtotal' => $lineRefund,
                'returned_to_stock' => $refundItem['return_to_stock']
            ];
        }

        // Deduct from order totals
        $order->decrement('subtotal', $refundAmount);
        $order->decrement('total', $refundAmount);

        // Update customer statistics
        if ($order->customer_id) {
            $customer = Customer::find($order->customer_id);
            if ($customer) {
                $customer->decrement('total_purchases', $refundAmount);
            }
        }

        $returnObj = \App\Models\OrderReturn::create([
            'return_number' => 'RET-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4)),
            'order_id' => $order->id,
            'reason' => 'POS Refund',
            'status' => 'Processed',
            'refund_amount' => $refundAmount,
            'refunded_items' => $processedItems,
            'notes' => 'Processed via POS terminal.',
        ]);

        $this->notificationService->refundProcessed($returnObj, $order);

        return response()->json([
            'message' => 'Refund processed successfully',
            'return_number' => $returnObj->return_number,
            'refund_amount' => $refundAmount,
            'refunded_items' => $processedItems,
            'order' => $order->toFrontend(),
        ]);
    }
}