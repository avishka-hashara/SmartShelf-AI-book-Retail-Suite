<?php

// tests/Unit/ProductServiceTest.php

namespace Tests\Unit;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ProductServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProductService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProductService();
    }

    /* ─────────────────────────────────────────────────
       STATUS DERIVATION TESTS
       ───────────────────────────────────────────────── */

    public function test_product_status_is_in_stock_when_above_threshold(): void
    {
        $product = Product::factory()->create([
            'stock_level'         => 50,
            'low_stock_threshold' => 10,
        ]);

        $this->assertEquals('in_stock', $product->status);
    }

    public function test_product_status_is_low_stock_when_at_threshold(): void
    {
        $product = Product::factory()->create([
            'stock_level'         => 10,
            'low_stock_threshold' => 10,
        ]);

        $this->assertEquals('low_stock', $product->status);
    }

    public function test_product_status_is_low_stock_when_below_threshold(): void
    {
        $product = Product::factory()->create([
            'stock_level'         => 5,
            'low_stock_threshold' => 10,
        ]);

        $this->assertEquals('low_stock', $product->status);
    }

    public function test_product_status_is_out_of_stock_when_zero(): void
    {
        $product = Product::factory()->create([
            'stock_level'         => 0,
            'low_stock_threshold' => 10,
        ]);

        $this->assertEquals('out_of_stock', $product->status);
    }

    public function test_status_auto_updates_on_stock_change(): void
    {
        $product = Product::factory()->create([
            'stock_level'         => 50,
            'low_stock_threshold' => 10,
        ]);

        $this->assertEquals('in_stock', $product->status);

        // Reduce to below threshold
        $product->stock_level = 5;
        $product->save();
        $this->assertEquals('low_stock', $product->fresh()->status);

        // Reduce to zero
        $product->stock_level = 0;
        $product->save();
        $this->assertEquals('out_of_stock', $product->fresh()->status);
    }

    /* ─────────────────────────────────────────────────
       CREATE TESTS
       ───────────────────────────────────────────────── */

    public function test_create_product_with_unique_sku(): void
    {
        $product = $this->service->createProduct([
            'name'        => 'Atomic Habits',
            'brand'       => 'James Clear',
            'sku'         => '978-0735211292',
            'category'    => 'books',
            'unit_price'  => 1250.00,
            'stock_level' => 42,
            'added_by'    => 'Admin',
        ]);

        $this->assertDatabaseHas('products', ['sku' => '978-0735211292']);
        $this->assertEquals('Atomic Habits', $product->name);
    }

    public function test_create_product_fails_with_duplicate_sku(): void
    {
        Product::factory()->create(['sku' => 'DUPLICATE-SKU']);

        $this->expectException(ValidationException::class);

        $this->service->createProduct([
            'name'        => 'Another Product',
            'brand'       => 'Brand',
            'sku'         => 'DUPLICATE-SKU',
            'category'    => 'stationery',
            'unit_price'  => 500.00,
            'stock_level' => 10,
            'added_by'    => 'Admin',
        ]);
    }

    /* ─────────────────────────────────────────────────
       UPDATE TESTS
       ───────────────────────────────────────────────── */

    public function test_update_product_recalculates_status(): void
    {
        $product = Product::factory()->create([
            'stock_level'         => 50,
            'low_stock_threshold' => 10,
        ]);

        $this->assertEquals('in_stock', $product->status);

        $updated = $this->service->updateProduct($product->id, [
            'name'                => $product->name,
            'brand'               => $product->brand,
            'sku'                 => $product->sku,
            'category'            => $product->category,
            'unit_price'          => $product->unit_price,
            'stock_level'         => 3,  // below threshold
            'low_stock_threshold' => 10,
        ]);

        $this->assertEquals('low_stock', $updated->status);
    }

    /* ─────────────────────────────────────────────────
       DELETE TESTS
       ───────────────────────────────────────────────── */

    public function test_delete_product_succeeds_with_no_sales(): void
    {
        $product = Product::factory()->create();

        $result = $this->service->deleteProduct($product->id);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    /* ─────────────────────────────────────────────────
       STOCK ADJUSTMENT TESTS
       ───────────────────────────────────────────────── */

    public function test_adjust_stock_positive_increases_level(): void
    {
        $product = Product::factory()->create(['stock_level' => 10]);

        $updated = $this->service->adjustStock($product->id, 20);

        $this->assertEquals(30, $updated->stock_level);
    }

    public function test_adjust_stock_negative_decreases_level(): void
    {
        $product = Product::factory()->create(['stock_level' => 20]);

        $updated = $this->service->adjustStock($product->id, -5);

        $this->assertEquals(15, $updated->stock_level);
    }

    public function test_adjust_stock_cannot_go_below_zero(): void
    {
        $product = Product::factory()->create(['stock_level' => 5]);

        $updated = $this->service->adjustStock($product->id, -100);

        $this->assertEquals(0, $updated->stock_level);
        $this->assertEquals('out_of_stock', $updated->status);
    }

    /* ─────────────────────────────────────────────────
       ACCESSOR TESTS
       ───────────────────────────────────────────────── */

    public function test_margin_percentage_calculated_correctly(): void
    {
        $product = Product::factory()->create([
            'unit_price' => 1000.00,
            'cost_price' => 600.00,
        ]);

        // Margin = (1000 - 600) / 1000 * 100 = 40.0%
        $this->assertEquals('40.0%', $product->margin_percentage);
    }

    public function test_margin_percentage_is_null_without_cost_price(): void
    {
        $product = Product::factory()->create(['cost_price' => null]);

        $this->assertNull($product->margin_percentage);
    }

    /* ─────────────────────────────────────────────────
       SCOPE TESTS
       ───────────────────────────────────────────────── */

    public function test_low_stock_scope_returns_correct_products(): void
    {
        Product::factory()->create(['stock_level' => 50, 'low_stock_threshold' => 10]); // in_stock
        Product::factory()->create(['stock_level' => 5,  'low_stock_threshold' => 10]); // low_stock
        Product::factory()->create(['stock_level' => 0,  'low_stock_threshold' => 10]); // out_of_stock

        $lowStockProducts = $this->service->getLowStockProducts();

        $this->assertCount(2, $lowStockProducts);
    }

    public function test_category_stats_returns_correct_totals(): void
    {
        Product::factory()->count(3)->create(['category' => 'books', 'stock_level' => 20, 'low_stock_threshold' => 10]);
        Product::factory()->count(2)->create(['category' => 'stationery', 'stock_level' => 5, 'low_stock_threshold' => 10]);

        $stats = $this->service->getCategoryStats();

        $this->assertEquals(3, $stats['books']['total_products']);
        $this->assertEquals(2, $stats['stationery']['total_products']);
        // low_stock_count: stationery items are at 5 which is <= threshold 10
        $this->assertEquals(2, $stats['stationery']['low_stock_count']);
    }
}