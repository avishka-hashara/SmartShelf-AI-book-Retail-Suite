<?php

// database/migrations/2026_02_20_000001_create_products_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand');                          // author for books, manufacturer for others
            $table->string('sku')->unique();                  // ISBN for books
            $table->string('category', 100);                 // open-ended: books, stationery, school_accessories, or any custom value
            $table->text('description')->nullable();
            $table->decimal('unit_price', 10, 2);
            $table->decimal('cost_price', 10, 2)->nullable(); // optional — for margin calc
            $table->integer('stock_level')->default(0);
            $table->integer('low_stock_threshold')->default(10);

            /*
             * Status is auto-derived from stock_level vs threshold:
             *   stock = 0                              → out_of_stock
             *   0 < stock <= low_stock_threshold       → low_stock
             *   stock > low_stock_threshold            → in_stock
             */
            $table->enum('status', ['in_stock', 'low_stock', 'out_of_stock'])->default('in_stock');

            $table->string('image_path')->nullable();
            $table->string('added_by');                       // cashier / staff name
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};