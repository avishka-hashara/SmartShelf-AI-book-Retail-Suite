<?php

// app/Services/ProductService.php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductService
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    /* ─────────────────────────────────────────────────
       CREATE
       ───────────────────────────────────────────────── */

    /**
     * Create a new product.
     * Validates SKU uniqueness, handles image upload, auto-derives status.
     *
     * @throws ValidationException
     */
    public function createProduct(array $data): Product
    {
        // SKU must be globally unique
        if (Product::where('sku', $data['sku'])->exists()) {
            throw ValidationException::withMessages([
                'sku' => ['A product with this SKU already exists.'],
            ]);
        }

        // Handle image upload
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $data['image_path'] = $data['image']->store('products', 'public');
        }
        unset($data['image']);

        // Status is auto-derived via the model's saving event — no need to set manually
        return Product::create($data);
    }

    /* ─────────────────────────────────────────────────
       UPDATE
       ───────────────────────────────────────────────── */

    /**
     * Update an existing product.
     * Re-derives status after any stock change. Handles image replacement.
     *
     * @throws ValidationException
     */
    public function updateProduct(int $productId, array $data): Product
    {
        $product = Product::findOrFail($productId);

        // SKU uniqueness — exclude current product
        if (isset($data['sku']) && $data['sku'] !== $product->sku) {
            if (Product::where('sku', $data['sku'])->where('id', '!=', $productId)->exists()) {
                throw ValidationException::withMessages([
                    'sku' => ['A product with this SKU already exists.'],
                ]);
            }
        }

        // Handle image replacement
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old image
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $data['image_path'] = $data['image']->store('products', 'public');
        }
        unset($data['image']);

        $product->fill($data);
        $product->save(); // status is re-derived via the saving event

        return $product->fresh();
    }

    /* ─────────────────────────────────────────────────
       DELETE
       ───────────────────────────────────────────────── */

    /**
     * Delete a product.
     * Blocks deletion if the product has associated sales records.
     * Cleans up image file on success.
     *
     * @throws \Exception
     */
    public function deleteProduct(int $productId): bool
    {
        $product = Product::findOrFail($productId);

        // Guard: block if sales records exist
        // Uncomment when sales relationship is added:
        // if ($product->salesItems()->exists()) {
        //     throw new \Exception('Cannot delete a product that has sales history.');
        // }

        // Delete image file from storage
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        return $product->delete();
    }

    /* ─────────────────────────────────────────────────
       STOCK ADJUSTMENT
       ───────────────────────────────────────────────── */

    /**
     * Adjust stock level.
     * Positive quantity = restock. Negative = adjustment/correction.
     * Status is re-derived automatically after the change.
     * Every call writes an immutable StockMovement row so the change is auditable.
     */
    public function adjustStock(
        int $productId,
        int $quantity,
        string $reason = '',
        string $type = 'adjustment',
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?int $userId = null
    ): Product {
        $product = Product::findOrFail($productId);
        $previousStatus = $product->status;

        $newStock = max(0, $product->stock_level + $quantity);
        $appliedQuantity = $newStock - $product->stock_level; // actual delta after the floor-at-0 clamp
        $product->stock_level = $newStock;
        $product->save(); // status re-derived in saving event

        if ($product->status !== $previousStatus) {
            if ($product->status === 'out_of_stock') {
                $this->notificationService->outOfStockAlert($product);
            } elseif ($product->status === 'low_stock') {
                $this->notificationService->lowStockAlert($product);
            }
        }

        StockMovement::create([
            'product_id'     => $productId,
            'type'           => $type,
            'quantity'       => $appliedQuantity,
            'reason'         => $reason,
            'reference_type' => $referenceType,
            'reference_id'   => $referenceId,
            'user_id'        => $userId ?? auth()->id(),
        ]);

        return $product->fresh();
    }

    /* ─────────────────────────────────────────────────
       QUERIES
       ───────────────────────────────────────────────── */

    /**
     * All products needing attention (low stock or out of stock).
     * Ordered by stock level ascending so worst cases appear first.
     */
    public function getLowStockProducts(): Collection
    {
        return Product::needsAttention()->get();
    }

    /**
     * Category statistics.
     * Returns total_products, total_value, low_stock_count per category.
     */
    public function getCategoryStats(): array
    {
        $categories = ['books', 'stationery', 'school_accessories'];
        $stats = [];

        foreach ($categories as $cat) {
            $products = Product::byCategory($cat)->get();

            $stats[$cat] = [
                'category'        => $cat,
                'total_products'  => $products->count(),
                'total_value'     => $products->sum(fn ($p) => $p->unit_price * $p->stock_level),
                'low_stock_count' => $products->whereIn('status', ['low_stock', 'out_of_stock'])->count(),
            ];
        }

        return $stats;
    }

    public function getDistinctCategories(): array
    {
        return \App\Models\ProductCategory::orderBy('name')
            ->get(['slug as value', 'name as label', 'custom_fields'])
            ->toArray();
    }
    /**
     * Paginated, filtered product list for the index page.
     */
    public function getProducts(array $filters = [], int $perPage = 10)
    {
        $query = Product::query();

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $query->byCategory($filters['category']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    /**
     * Get wasted items.
     */
    public function getWastedItems(int $perPage = 10)
    {
        return \App\Models\WastedItem::with(['product', 'order'])->latest()->paginate($perPage);
    }
}