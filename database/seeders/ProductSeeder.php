<?php

// database/seeders/ProductSeeder.php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // ── Books ──────────────────────────────────────
            [
                'name'                => 'Atomic Habits',
                'brand'               => 'James Clear',
                'sku'                 => '978-0735211292',
                'category'            => 'books',
                'description'         => 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.',
                'unit_price'          => 1250.00,
                'cost_price'          => 750.00,
                'stock_level'         => 42,
                'low_stock_threshold' => 10,
                'added_by'            => 'Admin',
            ],
            [
                'name'                => 'Sapiens',
                'brand'               => 'Yuval Noah Harari',
                'sku'                 => '978-0062316097',
                'category'            => 'books',
                'description'         => 'A Brief History of Humankind.',
                'unit_price'          => 1450.00,
                'cost_price'          => 900.00,
                'stock_level'         => 0,             // → Out of Stock
                'low_stock_threshold' => 10,
                'added_by'            => 'Admin',
            ],
            [
                'name'                => 'The Great Gatsby',
                'brand'               => 'F. Scott Fitzgerald',
                'sku'                 => '978-0743273565',
                'category'            => 'books',
                'description'         => 'A classic novel of the Jazz Age.',
                'unit_price'          => 850.00,
                'cost_price'          => 500.00,
                'stock_level'         => 7,             // → Low Stock
                'low_stock_threshold' => 10,
                'added_by'            => 'Admin',
            ],
            [
                'name'                => '1984',
                'brand'               => 'George Orwell',
                'sku'                 => '978-0451524935',
                'category'            => 'books',
                'description'         => 'A dystopian social science fiction novel.',
                'unit_price'          => 950.00,
                'cost_price'          => 550.00,
                'stock_level'         => 15,            // → In Stock
                'low_stock_threshold' => 10,
                'added_by'            => 'Admin',
            ],
            [
                'name'                => 'Project Hail Mary',
                'brand'               => 'Andy Weir',
                'sku'                 => '978-0593135204',
                'category'            => 'books',
                'description'         => 'A lone astronaut must save Earth.',
                'unit_price'          => 1350.00,
                'cost_price'          => 800.00,
                'stock_level'         => 56,            // → In Stock
                'low_stock_threshold' => 10,
                'added_by'            => 'Admin',
            ],

            // ── Stationery ─────────────────────────────────
            [
                'name'                => 'Moleskine Classic Notebook',
                'brand'               => 'Moleskine',
                'sku'                 => 'MS-CLS-BLK-L',
                'category'            => 'stationery',
                'description'         => 'Large ruled softcover notebook, black.',
                'unit_price'          => 1950.00,
                'cost_price'          => 1200.00,
                'stock_level'         => 8,             // → Low Stock
                'low_stock_threshold' => 10,
                'added_by'            => 'Admin',
            ],
            [
                'name'                => 'A4 Copy Paper (500 Sheets)',
                'brand'               => 'Xerox',
                'sku'                 => 'XER-A4-500',
                'category'            => 'stationery',
                'description'         => '80gsm white copy paper, 500 sheets per ream.',
                'unit_price'          => 1200.00,
                'cost_price'          => 750.00,
                'stock_level'         => 50,            // → In Stock
                'low_stock_threshold' => 10,
                'added_by'            => 'Admin',
            ],
            [
                'name'                => 'Stapler',
                'brand'               => 'Bostitch',
                'sku'                 => 'BOS-STP-B1',
                'category'            => 'stationery',
                'description'         => 'Standard office stapler, 20-sheet capacity.',
                'unit_price'          => 1150.00,
                'cost_price'          => 650.00,
                'stock_level'         => 8,             // → Low Stock
                'low_stock_threshold' => 10,
                'added_by'            => 'Admin',
            ],

            // ── School Accessories ─────────────────────────
            [
                'name'                => 'Faber-Castell 12-Pack Pencils',
                'brand'               => 'Faber-Castell',
                'sku'                 => 'FC-12-P',
                'category'            => 'school_accessories',
                'description'         => 'HB graphite pencils, 12 per box.',
                'unit_price'          => 850.00,
                'cost_price'          => 450.00,
                'stock_level'         => 120,           // → In Stock
                'low_stock_threshold' => 20,
                'added_by'            => 'Admin',
            ],
            [
                'name'                => 'Casio Scientific Calculator',
                'brand'               => 'Casio',
                'sku'                 => 'FX-991EX',
                'category'            => 'school_accessories',
                'description'         => 'Advanced scientific calculator with 552 functions.',
                'unit_price'          => 3200.00,
                'cost_price'          => 2000.00,
                'stock_level'         => 25,            // → In Stock
                'low_stock_threshold' => 5,
                'added_by'            => 'Admin',
            ],
        ];

        foreach ($products as $data) {
            Product::create($data);
        }
    }
}