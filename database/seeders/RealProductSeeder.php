<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\User;

class RealProductSeeder extends Seeder
{
    public function run()
    {
        $books = [
            ['Madol Doova', 'Martin Wickramasinghe'],
            ['Gamperaliya', 'Martin Wickramasinghe'],
            ['Ape Gama', 'Martin Wickramasinghe'],
            ['Amba Yaluwo', 'T.B. Ilangaratne'],
            ['Senkottan', 'Mahinda Prasad Masimbula'],
            ['Hathpana', 'Munidasa Cumaratunga'],
            ['Harry Potter and the Sorcerer\'s Stone', 'J.K. Rowling'],
            ['The Hobbit', 'J.R.R. Tolkien'],
            ['Rich Dad Poor Dad', 'Robert T. Kiyosaki'],
            ['Atomic Habits', 'James Clear'],
            ['The Alchemist', 'Paulo Coelho'],
            ['Sapiens: A Brief History of Humankind', 'Yuval Noah Harari'],
            ['1984', 'George Orwell'],
            ['To Kill a Mockingbird', 'Harper Lee'],
            ['The Great Gatsby', 'F. Scott Fitzgerald'],
            ['The Da Vinci Code', 'Dan Brown'],
            ['A Brief History of Time', 'Stephen Hawking'],
            ['Thinking, Fast and Slow', 'Daniel Kahneman'],
            ['The Catcher in the Rye', 'J.D. Salinger'],
            ['The Kite Runner', 'Khaled Hosseini'],
        ];

        $stationery = [
            ['Atlas CR Book 120 Pages', 'Atlas'],
            ['Atlas CR Book 160 Pages', 'Atlas'],
            ['Atlas Chooty Pen Blue', 'Atlas'],
            ['Atlas Chooty Pen Black', 'Atlas'],
            ['Natraj Pencils Pack of 10', 'Natraj'],
            ['Faber-Castell Color Pencils 24', 'Faber-Castell'],
            ['Mango Highlighter Yellow', 'Mango'],
            ['Mango A4 Paper Ream (80gsm)', 'Mango'],
            ['Double A A4 Paper Ream (80gsm)', 'Double A'],
            ['Pilot V5 Hi-Tecpoint Pen Black', 'Pilot'],
            ['Casio Scientific Calculator FX-991EX', 'Casio'],
            ['Camel Water Colors 12 Shades', 'Camel'],
            ['Maped Geometry Box', 'Maped'],
            ['Cello Gripper Ball Pen Blue', 'Cello'],
            ['Kangaro Stapler No. 10', 'Kangaro'],
        ];

        $schoolAccessories = [
            ['Polo School Bag Blue', 'Polo'],
            ['Nike School Bag Black', 'Nike'],
            ['Puma Water Bottle 750ml', 'Puma'],
            ['Tupperware Lunch Box Set', 'Tupperware'],
            ['Milton Thermos Flask 500ml', 'Milton'],
            ['Bata School Shoes Black Size 8', 'Bata'],
            ['Bata School Shoes White Size 7', 'Bata'],
            ['Atlas Pencil Case Blue', 'Atlas'],
            ['Faber-Castell Eraser Pack of 5', 'Faber-Castell'],
            ['Maped Sharpener 2 Hole', 'Maped'],
            ['DSI School Bag Red', 'DSI'],
            ['DSI School Shoes Black Size 6', 'DSI'],
            ['Atlas Water Bottle 500ml', 'Atlas'],
            ['Mango Lunch Box Compartment', 'Mango'],
            ['Kids Umbrella Cartoon', 'Local'],
        ];

        $products = [];

        foreach ($books as $item) {
            $products[] = [
                'name' => $item[0],
                'brand' => $item[1],
                'category' => 'books',
            ];
        }
        foreach ($stationery as $item) {
            $products[] = [
                'name' => $item[0],
                'brand' => $item[1],
                'category' => 'stationery',
            ];
        }
        foreach ($schoolAccessories as $item) {
            $products[] = [
                'name' => $item[0],
                'brand' => $item[1],
                'category' => 'school_accessories',
            ];
        }

        // Limit to exactly 50
        $products = array_slice($products, 0, 50);

        $userId = User::first()->id ?? 1;

        foreach ($products as $i => $item) {
            $cost = rand(100, 2500);
            $unit = $cost + rand(50, 1000);
            $stock = rand(5, 100);

            Product::create([
                'name' => $item['name'],
                'brand' => $item['brand'],
                'sku' => strtoupper(substr($item['category'], 0, 3)) . '-' . rand(1000, 9999) . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'category' => $item['category'],
                'description' => 'A high quality product from ' . $item['brand'] . '.',
                'unit_price' => $unit,
                'cost_price' => $cost,
                'stock_level' => $stock,
                'low_stock_threshold' => 10,
                'status' => 'in_stock',
                'added_by' => $userId,
            ]);
        }
    }
}
