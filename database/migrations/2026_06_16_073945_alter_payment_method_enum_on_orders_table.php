<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Split Payment') DEFAULT 'Cash'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting the enum requires making sure no 'Split Payment' exists, which is risky.
        // We'll leave it as is or revert the definition without losing data if possible.
        // DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'Digital Wallet') DEFAULT 'Cash'");
    }
};
