<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderReturn;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Requests\StoreReturnRequest;
use App\Http\Requests\UpdateReturnRequest;
use App\Services\ProductService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function __construct(private readonly ProductService $productService)
    {
    }
    /**
     * Display the Sales & Orders page with all orders, returns, and customers.
     */
    public function index(): Response
    {
        $orders = Order::with(['items', 'customer', 'payments'])
            ->latest()
            ->get()
            ->map(fn (Order $o) => $o->toFrontend());

        $returns = OrderReturn::with(['order.items', 'order.customer'])
            ->latest()
            ->get()
            ->map(fn (OrderReturn $r) => $r->toFrontend());

        $customers = Customer::select('id', 'name', 'email', 'customer_code')
            ->where('status', 'Active')
            ->orderBy('name')
            ->get()
            ->map(fn (Customer $c) => [
                'id'    => $c->id,
                'name'  => $c->name,
                'email' => $c->email,
            ]);

        return Inertia::render('Sales/Sale', compact('orders', 'returns', 'customers'));
    }

    /**
     * Create a new order with its line items.
     */
    public function store(StoreOrderRequest $request): RedirectResponse
    {
        $v = $request->validated();

        // Resolve customer name/email
        $customerId    = !empty($v['customer_id']) ? (int) $v['customer_id'] : null;
        $customerName  = $v['customer_name'] ?? null;
        $customerEmail = $v['customer_email'] ?? null;

        if ($customerId) {
            $customer      = Customer::find($customerId);
            $customerName  = $customer?->name;
            $customerEmail = $customer?->email;
        }

        // Calculate totals
        $subtotal = collect($v['items'])->sum(fn ($i) => $i['qty'] * $i['unit_price']);
        $discount = (float) ($v['discount'] ?? 0);
        $total    = max(0, $subtotal - $discount);

        // Create order
        $order = Order::create([
            'order_number'   => 'TEMP',
            'user_id'        => auth()->id(),
            'customer_id'    => $customerId,
            'customer_name'  => $customerName,
            'customer_email' => $customerEmail,
            'payment_method' => $v['payment_method'],
            'status'         => $v['status'],
            'subtotal'       => $subtotal,
            'discount'       => $discount,
            'total'          => $total,
            'notes'          => $v['notes'] ?? null,
        ]);

        // Generate order number after insert
        $order->order_number = 'INV-' . date('Y') . '-' . str_pad($order->id, 4, '0', STR_PAD_LEFT);
        $order->save();

        if (!empty($v['split_payments'])) {
            $splits = collect($v['split_payments']);
            $order->update(['payment_method' => 'Split Payment']);
            
            foreach ($splits as $split) {
                $order->payments()->create([
                    'payment_method' => $split['method'],
                    'amount' => $split['amount']
                ]);
            }
        }

        // Create line items
        foreach ($v['items'] as $item) {
            $orderItem = $order->items()->create([
                'product_id' => $item['product_id'] ?? null,
                'title'      => $item['title'],
                'qty'        => (int) $item['qty'],
                'unit_price' => (float) $item['unit_price'],
                'subtotal'   => $item['qty'] * $item['unit_price'],
            ]);
            
            // Note: Stock deduction is handled in the POS Terminal checkout process
            // via the /products/{id}/stock endpoint. Do NOT deduct again here.
        }

        // Update customer stats if linked and completed
        if ($customerId && $v['status'] === 'Completed') {
            $customer = Customer::find($customerId);
            if ($customer) {
                $customer->increment('orders');
                $customer->increment('total_purchases', $total);
                $customer->update(['last_visit' => now()->toDateString()]);
            }
        }

        return back()->with('success', "Order {$order->order_number} created successfully!");
    }

    /**
     * Update an order's payment method, status, discount, or notes.
     */
    public function update(UpdateOrderRequest $request, Order $order): RedirectResponse
    {
        $v          = $request->validated();
        $wasCompleted = $order->status === 'Completed';
        $isNowCompleted = ($v['status'] ?? $order->status) === 'Completed';

        // Recalculate total if discount changed
        if (array_key_exists('discount', $v)) {
            $v['total'] = max(0, $order->subtotal - (float) ($v['discount'] ?? 0));
        }

        $order->update($v);

        // Deduct stock if order is newly completed
        if (!$wasCompleted && $isNowCompleted) {
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    $this->productService->adjustStock(
                        $item->product_id,
                        -($item->qty),
                        "Order {$order->order_number} marked as completed",
                        'sale',
                        'order',
                        $order->id
                    );
                }
            }
        }

        // Update customer stats if newly completed
        if (!$wasCompleted && $isNowCompleted && $order->customer_id) {
            $customer = Customer::find($order->customer_id);
            if ($customer) {
                $customer->increment('orders');
                $customer->increment('total_purchases', $order->total);
                $customer->update(['last_visit' => now()->toDateString()]);
            }
        }

        return back()->with('success', "Order {$order->order_number} updated successfully.");
    }

    /**
     * Cancel an order and restore stock for all items (if it was completed).
     */
    public function destroy(Order $order): RedirectResponse
    {
        // Reload to ensure items are loaded
        $order->load('items');
        
        $number = $order->order_number;
        $wasCompleted = $order->status === 'Completed';

        if ($wasCompleted) {
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    $this->productService->adjustStock(
                        $item->product_id,
                        $item->qty,
                        "Order {$number} cancelled",
                        'adjustment',
                        'order',
                        $order->id
                    );
                }
            }

            // Update customer stats
            if ($order->customer_id) {
                $customer = Customer::find($order->customer_id);
                if ($customer) {
                    $customer->decrement('orders');
                    $customer->decrement('total_purchases', $order->total);
                }
            }
        }

        $order->update(['status' => 'Cancelled']);

        return back()->with('success', "Order {$number} has been cancelled and stock has been restored.");
    }

    /**
     * Submit a new return/refund request for an order.
     */
    public function storeReturn(StoreReturnRequest $request): RedirectResponse
    {
        $v     = $request->validated();
        $order = Order::findOrFail($v['order_id']);

        $return = OrderReturn::create([
            'return_number' => 'TEMP',
            'order_id'      => $v['order_id'],
            'reason'        => $v['reason'],
            'status'        => 'Requested',
            'refund_amount' => $order->total,
            'notes'         => $v['notes'] ?? null,
        ]);

        $return->return_number = 'RET-' . date('Y') . '-' . str_pad($return->id, 4, '0', STR_PAD_LEFT);
        $return->save();

        return back()->with('success', "Return request {$return->return_number} submitted successfully.");
    }

    /**
     * Approve, reject, or mark a return as processed.
     */
    public function updateReturn(UpdateReturnRequest $request, OrderReturn $orderReturn): RedirectResponse
    {
        $status = $request->status;
        $order = $orderReturn->order;

        // If newly processed, handle stock and stats
        if ($orderReturn->status !== 'Processed' && $status === 'Processed') {
            $order->load('items');
            
            // Restore stock
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    $this->productService->adjustStock(
                        $item->product_id,
                        $item->qty,
                        "Return {$orderReturn->return_number} processed",
                        'return',
                        'order_return',
                        $orderReturn->id
                    );
                }
                // Zero out item
                $item->update(['qty' => 0, 'subtotal' => 0]);
            }

            // Update customer stats
            if ($order->customer_id) {
                $customer = Customer::find($order->customer_id);
                if ($customer) {
                    $customer->decrement('total_purchases', $orderReturn->refund_amount);
                }
            }

            // Zero out order total and set status
            $order->update([
                'status' => 'Refunded',
                'subtotal' => 0,
                'total' => 0
            ]);
        }

        $orderReturn->update([
            'status'        => $status,
            'refund_amount' => $status === 'Rejected' ? 0 : $orderReturn->refund_amount,
        ]);

        return back()->with('success', "Return {$orderReturn->return_number} marked as {$status}.");
    }
}
