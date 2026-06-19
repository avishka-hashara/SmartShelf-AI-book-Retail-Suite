<?php

// database/migrations/2026_03_04_000001_create_promotions_table.php

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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            
            // Type: 'bundle' (combine products), 'discount' (discount on products)
            $table->enum('type', ['bundle', 'discount'])->default('discount');
            
            // Discount type: 'percentage' or 'fixed'
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage');
            
            // Discount value (percentage 0-100 or fixed amount)
            $table->decimal('discount_value', 10, 2)->default(0);
            
            // For bundles: the bundle price (if null, calculated from discounted products)
            $table->decimal('bundle_price', 10, 2)->nullable();
            
            // Validity period
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            
            // Active status
            $table->boolean('is_active')->default(true);
            
            // Minimum purchase amount to apply (optional)
            $table->decimal('min_purchase_amount', 10, 2)->nullable();
            
            // Usage limits
            $table->integer('usage_limit')->nullable(); // null = unlimited
            $table->integer('times_used')->default(0);
            
            // Promo code (optional, for code-based promotions)
            $table->string('promo_code')->nullable()->unique();
            
            // Priority for display ordering
            $table->integer('priority')->default(0);
            
            // Image for promotion banner
            $table->string('image_path')->nullable();
            
            // Who created it
            $table->string('created_by')->nullable();
            
            $table->timestamps();
            
            // Indexes for common queries
            $table->index(['is_active', 'start_date', 'end_date']);
            $table->index('type');
        });

        Schema::create('promotion_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            
            // Quantity required in bundle
            $table->integer('quantity')->default(1);
            
            // Optional per-product discount override
            $table->decimal('discount_override', 10, 2)->nullable();
            
            $table->timestamps();
            
            // Prevent duplicate product in same promotion
            $table->unique(['promotion_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_products');
        Schema::dropIfExists('promotions');
    }
};
