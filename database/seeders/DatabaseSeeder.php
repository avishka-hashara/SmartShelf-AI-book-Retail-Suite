<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call all seeders in a clean order once.
        $this->call([
            AdminUserSeeder::class,
            RolePermissionSeeder::class,
            ProductCategorySeeder::class,
        ]);
    }
}