<?php

namespace Database\Seeders;

use App\Models\StoreSettings;
use Illuminate\Database\Seeder;

class StoreSettingsSeeder extends Seeder
{
    public function run(): void
    {
        StoreSettings::firstOrCreate(
            ['id' => 1],
            [
                'shop_name'           => 'My Bookshop',
                'tagline'             => null,
                'brand_color'         => '#4F46E5',
                'currency'            => 'LKR',
                'timezone'            => 'Asia/Colombo',
                'low_stock_threshold' => 5,
                'enable_loyalty'      => true,
            ]
        );
    }
}
