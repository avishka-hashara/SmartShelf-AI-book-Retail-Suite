<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reading_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name')->nullable();
            $table->string('seat_number');
            $table->timestamp('check_in_at')->useCurrent();
            $table->timestamp('check_out_at')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->decimal('billed_units', 8, 1)->nullable();
            $table->decimal('hourly_rate', 8, 2)->default(350);
            $table->decimal('total_amount', 8, 2)->nullable();
            $table->enum('payment_method', ['cash', 'card'])->nullable();
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->string('served_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reading_sessions');
    }
};
