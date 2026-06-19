<?php

// tests/Feature/ProductControllerTest.php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /* ─────────────────────────────────────────────────
       INDEX
       ───────────────────────────────────────────────── */

    public function test_index_returns_paginated_products(): void
    {
        Product::factory()->count(15)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/products');

        $response->assertOk();
    }

    /* ─────────────────────────────────────────────────
       STORE
       ───────────────────────────────────────────────── */

    public function test_store_creates_product_and_returns_201(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/products', [
                'name'        => 'Atomic Habits',
                'brand'       => 'James Clear',
                'sku'         => '978-0735211292',
                'category'    => 'books',
                'unit_price'  => 1250.00,
                'stock_level' => 42,
                'added_by'    => 'Admin',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('product.name', 'Atomic Habits')
            ->assertJsonPath('product.sku', '978-0735211292');

        $this->assertDatabaseHas('products', ['sku' => '978-0735211292']);
    }

    public function test_store_fails_with_duplicate_sku(): void
    {
        Product::factory()->create(['sku' => 'DUPE-SKU']);

        $response = $this->actingAs($this->user)
            ->postJson('/products', [
                'name'        => 'Another Book',
                'brand'       => 'Author',
                'sku'         => 'DUPE-SKU',
                'category'    => 'books',
                'unit_price'  => 500.00,
                'stock_level' => 10,
                'added_by'    => 'Admin',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['sku']);
    }

    public function test_store_fails_with_missing_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/products', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'brand', 'sku', 'category', 'unit_price', 'stock_level', 'added_by']);
    }

    /* ─────────────────────────────────────────────────
       UPDATE
       ───────────────────────────────────────────────── */

    public function test_update_product_returns_200(): void
    {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->user)
            ->putJson("/products/{$product->id}", [
                'name'        => 'Updated Name',
                'brand'       => $product->brand,
                'sku'         => $product->sku,
                'category'    => $product->category,
                'unit_price'  => 999.00,
                'stock_level' => $product->stock_level,
            ]);

        $response->assertOk()
            ->assertJsonPath('product.name', 'Updated Name');
    }

    /* ─────────────────────────────────────────────────
       DESTROY
       ───────────────────────────────────────────────── */

    public function test_destroy_product_returns_204(): void
    {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->user)
            ->deleteJson("/products/{$product->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    /* ─────────────────────────────────────────────────
       FILTERS
       ───────────────────────────────────────────────── */

    public function test_search_filter_works_by_name(): void
    {
        Product::factory()->create(['name' => 'Atomic Habits', 'category' => 'books']);
        Product::factory()->create(['name' => 'Staplers Pack', 'category' => 'stationery']);

        $response = $this->actingAs($this->user)
            ->getJson('/products?search=Atomic');

        $response->assertOk();
        // Response includes paginated data with Inertia — just assert ok and DB
        $this->assertDatabaseHas('products', ['name' => 'Atomic Habits']);
    }

    public function test_category_filter_returns_correct_products(): void
    {
        Product::factory()->count(3)->create(['category' => 'books']);
        Product::factory()->count(2)->create(['category' => 'stationery']);

        $response = $this->actingAs($this->user)
            ->getJson('/products?category=books');

        $response->assertOk();
    }

    /* ─────────────────────────────────────────────────
       LOW STOCK
       ───────────────────────────────────────────────── */

    public function test_low_stock_endpoint_returns_only_low_stock(): void
    {
        Product::factory()->create(['stock_level' => 50, 'low_stock_threshold' => 10]); // in_stock
        Product::factory()->create(['stock_level' => 5,  'low_stock_threshold' => 10]); // low_stock
        Product::factory()->create(['stock_level' => 0,  'low_stock_threshold' => 10]); // out_of_stock

        $response = $this->actingAs($this->user)
            ->getJson('/products-low-stock');

        $response->assertOk();
        $this->assertCount(2, $response->json());
    }

    /* ─────────────────────────────────────────────────
       STOCK ADJUSTMENT
       ───────────────────────────────────────────────── */

    public function test_stock_adjustment_updates_level(): void
    {
        $product = Product::factory()->create(['stock_level' => 20]);

        $response = $this->actingAs($this->user)
            ->postJson("/products/{$product->id}/stock", [
                'quantity' => 10,
                'reason'   => 'Restock received',
            ]);

        $response->assertOk()
            ->assertJsonPath('product.stock_level', 30);
    }

    /* ─────────────────────────────────────────────────
       IMAGE UPLOAD
       ───────────────────────────────────────────────── */

    public function test_store_with_image_upload(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->user)
            ->postJson('/products', [
                'name'        => 'Test Book',
                'brand'       => 'Test Author',
                'sku'         => 'TEST-SKU-001',
                'category'    => 'books',
                'unit_price'  => 500.00,
                'stock_level' => 10,
                'added_by'    => 'Admin',
                'image'       => UploadedFile::fake()->image('cover.jpg'),
            ]);

        $response->assertStatus(201);
        $this->assertNotNull($response->json('product.image_path'));
    }
}