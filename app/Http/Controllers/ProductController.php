<?php

// app/Http/Controllers/ProductController.php

namespace App\Http\Controllers;

use App\Http\Requests\AdjustStockRequest;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\WastedItemResource;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $productService)
    {
    }

    /* ─────────────────────────────────────────────────
       INDEX — Inertia page with paginated products
       ───────────────────────────────────────────────── */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'category', 'status', 'view']);
        
        if (isset($filters['view']) && $filters['view'] === 'wasted') {
            $wastedItems = $this->productService->getWastedItems(perPage: 10);
            return Inertia::render('Products/Product', [
                'wastedItems' => WastedItemResource::collection($wastedItems),
                'filters'     => $filters,
                'stats'       => $this->productService->getCategoryStats(),
                'categories'  => $this->productService->getDistinctCategories(),
            ]);
        }

        $products = $this->productService->getProducts($filters, perPage: 10);

        return Inertia::render('Products/Product', [
            'products'   => ProductResource::collection($products),
            'filters'    => $filters,
            'stats'      => $this->productService->getCategoryStats(),
            'categories' => $this->productService->getDistinctCategories(),
        ]);
    }

    /* ─────────────────────────────────────────────────
       STORE — Create a new product
       ───────────────────────────────────────────────── */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->productService->createProduct($request->validated());

        return redirect()->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    /* ─────────────────────────────────────────────────
       SHOW — Single product (JSON)
       ───────────────────────────────────────────────── */
    public function show(int $id): JsonResponse
    {
        $product = \App\Models\Product::findOrFail($id);

        return response()->json(new ProductResource($product));
    }

    /* ─────────────────────────────────────────────────
       UPDATE — Edit existing product
       ───────────────────────────────────────────────── */
    public function update(UpdateProductRequest $request, int $product): RedirectResponse
    {
        $this->productService->updateProduct($product, $request->validated());

        return redirect()->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    /* ─────────────────────────────────────────────────
       DESTROY — Delete product
       ───────────────────────────────────────────────── */
    public function destroy(int $product): RedirectResponse
    {
        $this->productService->deleteProduct($product);

        return redirect()->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /* ─────────────────────────────────────────────────
       ADJUST STOCK
       ───────────────────────────────────────────────── */
    public function adjustStock(AdjustStockRequest $request, int $product): JsonResponse
    {
        $updated = $this->productService->adjustStock(
            $product,
            $request->validated('quantity'),
            $request->validated('reason') ?? '',
            $request->validated('type') ?? 'adjustment'
        );

        return response()->json([
            'message' => 'Stock adjusted successfully.',
            'product' => new ProductResource($updated),
        ]);
    }

    /* ─────────────────────────────────────────────────
       LOW STOCK — Products needing attention
       ───────────────────────────────────────────────── */
    public function lowStock(): JsonResponse
    {
        $products = $this->productService->getLowStockProducts();

        return response()->json(ProductResource::collection($products));
    }

    /* ─────────────────────────────────────────────────
       STATS — Category breakdown
       ───────────────────────────────────────────────── */
    public function stats(): JsonResponse
    {
        return response()->json($this->productService->getCategoryStats());
    }
}