<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run()
    {
        Setting::firstOrCreate(
            ['key' => 'lounge_layout'],
            [
                'value' => [
                    ['id' => 'T1', 'label' => 'Table 1', 'seats' => 4],
                    ['id' => 'T2', 'label' => 'Table 2', 'seats' => 4],
                    ['id' => 'T3', 'label' => 'Table 3', 'seats' => 4],
                    ['id' => 'T4', 'label' => 'Table 4', 'seats' => 4]
                ]
            ]
        );
    }
}
