<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE app_notifications MODIFY COLUMN type ENUM('low_stock','out_of_stock','refund','purchase_order_received','daily_digest') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE app_notifications MODIFY COLUMN type ENUM('low_stock','out_of_stock','refund','purchase_order_received') NOT NULL");
    }
};
