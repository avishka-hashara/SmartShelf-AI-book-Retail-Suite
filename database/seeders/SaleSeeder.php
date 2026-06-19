<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderReturn;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SaleSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        if (Order::count() > 0) {
            $this->command->warn('⚠️  Orders already exist — skipping SaleSeeder.');
            return;
        }

        // ── Customer lookup helper ───────────────────────────────────────────
        $find = fn (string $email) => Customer::where('email', $email)->first();

        // ── Product catalogue ────────────────────────────────────────────────
        $p = [
            'atomic_habits' => ['title' => 'Atomic Habits',                 'price' => 1250.00],
            'sapiens'       => ['title' => 'Sapiens',                       'price' => 1450.00],
            'gatsby'        => ['title' => 'The Great Gatsby',              'price' =>  850.00],
            '1984'          => ['title' => '1984',                          'price' =>  950.00],
            'hail_mary'     => ['title' => 'Project Hail Mary',             'price' => 1350.00],
            'moleskine'     => ['title' => 'Moleskine Classic Notebook',    'price' => 1950.00],
            'a4_paper'      => ['title' => 'A4 Copy Paper (500 Sheets)',    'price' => 1200.00],
            'stapler'       => ['title' => 'Stapler',                       'price' => 1150.00],
            'pencils'       => ['title' => 'Faber-Castell 12-Pack Pencils', 'price' =>  850.00],
            'calculator'    => ['title' => 'Casio Scientific Calculator',   'price' => 3200.00],
        ];

        // Build an item row from a product + qty
        $item = fn (array $prod, int $qty) => [
            'title'      => $prod['title'],
            'qty'        => $qty,
            'unit_price' => $prod['price'],
            'subtotal'   => round($prod['price'] * $qty, 2),
        ];

        // ── Resolve customers ────────────────────────────────────────────────
        $jane     = $find('jane.cooper@example.com');
        $cody     = $find('cody.fisher@example.com');
        $esther   = $find('esther.howard@example.com');
        $cameron  = $find('cameron.w@example.com');
        $brooklyn = $find('brooklyn.s@example.com');
        $leslie   = $find('leslie.alexander@example.com');
        $savannah = $find('savannah.n@example.com');
        $dianne   = $find('dianne.russell@example.com');
        $guy      = $find('guy.hawkins@example.com');

        // ── Order definitions (15 orders) ────────────────────────────────────
        //  Keys:
        //    customer       → Customer model (registered)
        //    customer_name  → string | null  (walk-in override)
        //    customer_email → string | null  (walk-in override)
        //    payment        → enum string
        //    status         → Pending | Completed | Cancelled
        //    discount       → float
        //    notes          → string
        //    date           → datetime string
        //    items          → array of item rows
        $orderDefs = [
            // ── 1 · Jane Cooper · Completed ─────────────────────────────────
            [
                'customer' => $jane,
                'payment'  => 'Cash',
                'status'   => 'Completed',
                'discount' => 100.00,
                'notes'    => '',
                'date'     => '2026-02-10 10:15:00',
                'items'    => [
                    $item($p['atomic_habits'], 2),  // 2 500.00
                    $item($p['sapiens'], 1),         // 1 450.00
                ],
                // subtotal 3 950 · discount 100 · total 3 850
            ],
            // ── 2 · Walk-in (Alex Turner) · Completed ───────────────────────
            [
                'customer_name'  => 'Alex Turner',
                'customer_email' => 'alex.turner@gmail.com',
                'payment'        => 'Credit Card',
                'status'         => 'Completed',
                'discount'       => 0,
                'notes'          => '',
                'date'           => '2026-02-11 11:30:00',
                'items'          => [
                    $item($p['1984'], 1),       //  950.00
                    $item($p['moleskine'], 1),  // 1 950.00
                ],
                // subtotal 2 900 · total 2 900
            ],
            // ── 3 · Cameron Williamson · Completed ──────────────────────────
            [
                'customer' => $cameron,
                'payment'  => 'Digital Wallet',
                'status'   => 'Completed',
                'discount' => 150.00,
                'notes'    => '',
                'date'     => '2026-02-12 14:00:00',
                'items'    => [
                    $item($p['hail_mary'], 1), // 1 350.00
                    $item($p['pencils'], 2),   // 1 700.00
                ],
                // subtotal 3 050 · discount 150 · total 2 900
            ],
            // ── 4 · Cody Fisher · Pending ────────────────────────────────────
            [
                'customer' => $cody,
                'payment'  => 'Cash',
                'status'   => 'Pending',
                'discount' => 0,
                'notes'    => 'Customer requested gift wrapping',
                'date'     => '2026-02-13 09:45:00',
                'items'    => [
                    $item($p['gatsby'], 2), // 1 700.00
                ],
                // subtotal 1 700 · total 1 700
            ],
            // ── 5 · Walk-in (anonymous) · Completed ─────────────────────────
            [
                'customer_name'  => null,
                'customer_email' => null,
                'payment'        => 'Debit Card',
                'status'         => 'Completed',
                'discount'       => 0,
                'notes'          => '',
                'date'           => '2026-02-14 16:20:00',
                'items'          => [
                    $item($p['stapler'], 1),    // 1 150.00
                    $item($p['calculator'], 1), // 3 200.00
                ],
                // subtotal 4 350 · total 4 350
            ],
            // ── 6 · Leslie Alexander · Completed ────────────────────────────
            [
                'customer' => $leslie,
                'payment'  => 'Credit Card',
                'status'   => 'Completed',
                'discount' => 200.00,
                'notes'    => 'Bulk order for school project',
                'date'     => '2026-02-15 10:00:00',
                'items'    => [
                    $item($p['atomic_habits'], 1), // 1 250.00
                    $item($p['a4_paper'], 3),       // 3 600.00
                ],
                // subtotal 4 850 · discount 200 · total 4 650
            ],
            // ── 7 · Brooklyn Simmons · Cancelled ────────────────────────────
            [
                'customer' => $brooklyn,
                'payment'  => 'Cash',
                'status'   => 'Cancelled',
                'discount' => 0,
                'notes'    => 'Customer changed mind before payment was processed',
                'date'     => '2026-02-15 13:45:00',
                'items'    => [
                    $item($p['sapiens'], 1), // 1 450.00
                ],
                // subtotal 1 450 · total 1 450
            ],
            // ── 8 · Dianne Russell · Completed ──────────────────────────────
            [
                'customer' => $dianne,
                'payment'  => 'Digital Wallet',
                'status'   => 'Completed',
                'discount' => 50.00,
                'notes'    => '',
                'date'     => '2026-02-16 15:30:00',
                'items'    => [
                    $item($p['1984'], 2),    // 1 900.00
                    $item($p['pencils'], 1), //   850.00
                ],
                // subtotal 2 750 · discount 50 · total 2 700
            ],
            // ── 9 · Walk-in (Maria Garcia) · Pending ────────────────────────
            [
                'customer_name'  => 'Maria Garcia',
                'customer_email' => 'maria.garcia@example.com',
                'payment'        => 'Cash',
                'status'         => 'Pending',
                'discount'       => 0,
                'notes'          => 'Awaiting customer confirmation',
                'date'           => '2026-02-17 09:00:00',
                'items'          => [
                    $item($p['moleskine'], 2), // 3 900.00
                ],
                // subtotal 3 900 · total 3 900
            ],
            // ── 10 · Guy Hawkins · Completed ────────────────────────────────
            [
                'customer' => $guy,
                'payment'  => 'Cash',
                'status'   => 'Completed',
                'discount' => 0,
                'notes'    => '',
                'date'     => '2026-02-17 11:15:00',
                'items'    => [
                    $item($p['hail_mary'], 1), // 1 350.00
                ],
                // subtotal 1 350 · total 1 350
            ],
            // ── 11 · Savannah Nguyen · Pending ──────────────────────────────
            [
                'customer' => $savannah,
                'payment'  => 'Debit Card',
                'status'   => 'Pending',
                'discount' => 0,
                'notes'    => '',
                'date'     => '2026-02-18 10:30:00',
                'items'    => [
                    $item($p['atomic_habits'], 1), // 1 250.00
                    $item($p['stapler'], 1),        // 1 150.00
                ],
                // subtotal 2 400 · total 2 400
            ],
            // ── 12 · Jane Cooper · Completed ────────────────────────────────
            [
                'customer' => $jane,
                'payment'  => 'Credit Card',
                'status'   => 'Completed',
                'discount' => 100.00,
                'notes'    => '',
                'date'     => '2026-02-18 14:00:00',
                'items'    => [
                    $item($p['sapiens'], 1),   // 1 450.00
                    $item($p['a4_paper'], 2),  // 2 400.00
                ],
                // subtotal 3 850 · discount 100 · total 3 750
            ],
            // ── 13 · Walk-in (anonymous) · Cancelled ────────────────────────
            [
                'customer_name'  => null,
                'customer_email' => null,
                'payment'        => 'Cash',
                'status'         => 'Cancelled',
                'discount'       => 0,
                'notes'          => 'Item not available in sufficient stock',
                'date'           => '2026-02-19 09:30:00',
                'items'          => [
                    $item($p['calculator'], 1), // 3 200.00
                ],
                // subtotal 3 200 · total 3 200
            ],
            // ── 14 · Esther Howard · Pending ────────────────────────────────
            [
                'customer' => $esther,
                'payment'  => 'Cash',
                'status'   => 'Pending',
                'discount' => 0,
                'notes'    => '',
                'date'     => '2026-02-19 14:20:00',
                'items'    => [
                    $item($p['gatsby'], 1), // 850.00
                ],
                // subtotal 850 · total 850
            ],
            // ── 15 · Cameron Williamson · Completed ─────────────────────────
            [
                'customer' => $cameron,
                'payment'  => 'Digital Wallet',
                'status'   => 'Completed',
                'discount' => 300.00,
                'notes'    => 'Repeat customer — loyalty discount applied',
                'date'     => '2026-02-20 10:00:00',
                'items'    => [
                    $item($p['atomic_habits'], 3), // 3 750.00
                    $item($p['moleskine'], 1),      // 1 950.00
                ],
                // subtotal 5 700 · discount 300 · total 5 400
            ],
        ];

        // ── Create orders ────────────────────────────────────────────────────
        $createdOrders = [];

        foreach ($orderDefs as $def) {
            $customer = $def['customer'] ?? null;
            $subtotal = collect($def['items'])->sum('subtotal');
            $discount = (float) ($def['discount'] ?? 0);
            $total    = round($subtotal - $discount, 2);

            $order = Order::create([
                'order_number'   => 'TEMP',
                'customer_id'    => $customer?->id,
                'customer_name'  => $customer?->name  ?? ($def['customer_name']  ?? null),
                'customer_email' => $customer?->email ?? ($def['customer_email'] ?? null),
                'payment_method' => $def['payment'],
                'status'         => $def['status'],
                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'total'          => $total,
                'notes'          => $def['notes'] ?? '',
            ]);

            // Generate order number matching the controller convention
            $order->order_number = 'INV-' . date('Y') . '-' . str_pad($order->id, 4, '0', STR_PAD_LEFT);

            // Back-date for realistic demo data
            $order->timestamps = false;
            $order->created_at = Carbon::parse($def['date']);
            $order->updated_at = Carbon::parse($def['date']);
            $order->save();
            $order->timestamps = true;

            foreach ($def['items'] as $itemRow) {
                $order->items()->create($itemRow);
            }

            $createdOrders[] = $order;
        }

        $this->command->info('✅ Seeded ' . count($createdOrders) . ' orders.');

        // ── Return request definitions (4 returns, all for Completed orders) ─
        $returnDefs = [
            // ── RET-1 · ORD-1 (Jane Cooper) · Approved ──────────────────────
            [
                'order'   => $createdOrders[0],
                'reason'  => 'Received a duplicate copy of Atomic Habits by mistake',
                'status'  => 'Approved',
                'refund'  => 1250.00,
                'notes'   => 'Customer confirmed duplicate via receipt',
                'date'    => '2026-02-12 09:00:00',
            ],
            // ── RET-2 · ORD-3 (Cameron Williamson) · Requested ──────────────
            [
                'order'   => $createdOrders[2],
                'reason'  => 'Book arrived with torn pages, damaged in shipping',
                'status'  => 'Requested',
                'refund'  => 1350.00,
                'notes'   => 'Customer provided photo evidence of damage',
                'date'    => '2026-02-14 11:00:00',
            ],
            // ── RET-3 · ORD-6 (Leslie Alexander) · Processed ────────────────
            [
                'order'   => $createdOrders[5],
                'reason'  => 'Wrong edition of Atomic Habits was delivered',
                'status'  => 'Processed',
                'refund'  => 1250.00,
                'notes'   => 'Refund issued via original Credit Card payment',
                'date'    => '2026-02-17 14:30:00',
            ],
            // ── RET-4 · ORD-8 (Dianne Russell) · Rejected ───────────────────
            [
                'order'   => $createdOrders[7],
                'reason'  => 'Changed mind, items no longer needed',
                'status'  => 'Rejected',
                'refund'  => 0.00,
                'notes'   => 'Return window expired — exceeds 30-day policy',
                'date'    => '2026-02-19 10:00:00',
            ],
        ];

        // ── Create returns ───────────────────────────────────────────────────
        foreach ($returnDefs as $def) {
            $return = OrderReturn::create([
                'return_number' => 'TEMP',
                'order_id'      => $def['order']->id,
                'reason'        => $def['reason'],
                'status'        => $def['status'],
                'refund_amount' => $def['refund'],
                'notes'         => $def['notes'],
            ]);

            // Generate return number matching the controller convention
            $return->return_number = 'RET-' . date('Y') . '-' . str_pad($return->id, 4, '0', STR_PAD_LEFT);

            // Back-date for realistic demo data
            $return->timestamps = false;
            $return->created_at = Carbon::parse($def['date']);
            $return->updated_at = Carbon::parse($def['date']);
            $return->save();
            $return->timestamps = true;
        }

        $this->command->info('✅ Seeded ' . count($returnDefs) . ' return requests.');
    }
}
