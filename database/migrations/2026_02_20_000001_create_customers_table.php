<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customer_code')->unique()->nullable();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->decimal('total_purchases', 10, 2)->default(0);
            $table->integer('orders')->default(0);
            $table->date('last_visit')->nullable();
            $table->integer('loyalty_pts')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
