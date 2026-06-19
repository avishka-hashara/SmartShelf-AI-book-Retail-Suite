<?php

// app/Http/Controllers/PromotionController.php

namespace App\Http\Controllers;

use App\Http\Resources\PromotionResource;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    /* ─────────────────────────────────────────────────
       INDEX — Inertia page with all promotions
       ───────────────────────────────────────────────── */
    public function index(Request $request): Response
    {
        $query = Promotion::with('products')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('promo_code', 'like', "%{$search}%");
            });
        }

        $promotions = $query->paginate(10)->withQueryString();

        // Get all products for the form
        $products = Product::orderBy('name')
            ->get()
            ->map(fn (Product $p) => [
                'id'         => $p->id,
                'name'       => $p->name,
                'brand'      => $p->brand,
                'sku'        => $p->sku,
                'category'   => $p->category,
                'unit_price' => (float) $p->unit_price,
                'stock_level'=> $p->stock_level,
                'image_path' => $p->image_path,
            ]);

        return Inertia::render('Promotions/Promotions', [
            'promotions' => PromotionResource::collection($promotions),
            'products'   => $products,
            'filters'    => $request->only(['search', 'type', 'status']),
        ]);
    }

    /* ─────────────────────────────────────────────────
       STORE — Create a new promotion
       ───────────────────────────────────────────────── */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'description'         => 'nullable|string',
            'type'                => 'required|in:bundle,discount',
            'discount_type'       => 'required|in:percentage,fixed',
            'discount_value'      => 'required|numeric|min:0',
            'bundle_price'        => 'nullable|numeric|min:0',
            'start_date'          => 'nullable|date',
            'end_date'            => 'nullable|date|after_or_equal:start_date',
            'is_active'           => 'boolean',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'usage_limit'         => 'nullable|integer|min:1',
            'promo_code'          => 'nullable|string|max:50|unique:promotions,promo_code',
            'priority'            => 'integer|min:0',
            'image'               => 'nullable|image|max:5120',
            'products'            => 'required|array|min:1',
            'products.*.id'       => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.discount_override' => 'nullable|numeric|min:0',
        ]);

        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('promotions', 'public');
        }

        $promotion = Promotion::create([
            'name'                => $validated['name'],
            'description'         => $validated['description'] ?? null,
            'type'                => $validated['type'],
            'discount_type'       => $validated['discount_type'],
            'discount_value'      => $validated['discount_value'],
            'bundle_price'        => $validated['bundle_price'] ?? null,
            'start_date'          => $validated['start_date'] ?? null,
            'end_date'            => $validated['end_date'] ?? null,
            'is_active'           => $validated['is_active'] ?? true,
            'min_purchase_amount' => $validated['min_purchase_amount'] ?? null,
            'usage_limit'         => $validated['usage_limit'] ?? null,
            'promo_code'          => $validated['promo_code'] ?? null,
            'priority'            => $validated['priority'] ?? 0,
            'image_path'          => $imagePath,
            'created_by'          => auth()->user()->name ?? 'System',
        ]);

        // Attach products
        foreach ($validated['products'] as $product) {
            $promotion->products()->attach($product['id'], [
                'quantity'          => $product['quantity'],
                'discount_override' => $product['discount_override'] ?? null,
            ]);
        }

        return redirect()->route('promotions.index')
            ->with('success', 'Promotion created successfully.');
    }

    /* ─────────────────────────────────────────────────
       UPDATE — Edit existing promotion
       ───────────────────────────────────────────────── */
    public function update(Request $request, Promotion $promotion): RedirectResponse
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'description'         => 'nullable|string',
            'type'                => 'required|in:bundle,discount',
            'discount_type'       => 'required|in:percentage,fixed',
            'discount_value'      => 'required|numeric|min:0',
            'bundle_price'        => 'nullable|numeric|min:0',
            'start_date'          => 'nullable|date',
            'end_date'            => 'nullable|date|after_or_equal:start_date',
            'is_active'           => 'boolean',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'usage_limit'         => 'nullable|integer|min:1',
            'promo_code'          => 'nullable|string|max:50|unique:promotions,promo_code,' . $promotion->id,
            'priority'            => 'integer|min:0',
            'image'               => 'nullable|image|max:5120',
            'products'            => 'required|array|min:1',
            'products.*.id'       => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.discount_override' => 'nullable|numeric|min:0',
        ]);

        // Handle image upload
        $imagePath = $promotion->image_path;
        if ($request->hasFile('image')) {
            // Delete old image
            if ($promotion->image_path) {
                Storage::disk('public')->delete($promotion->image_path);
            }
            $imagePath = $request->file('image')->store('promotions', 'public');
        }

        $promotion->update([
            'name'                => $validated['name'],
            'description'         => $validated['description'] ?? null,
            'type'                => $validated['type'],
            'discount_type'       => $validated['discount_type'],
            'discount_value'      => $validated['discount_value'],
            'bundle_price'        => $validated['bundle_price'] ?? null,
            'start_date'          => $validated['start_date'] ?? null,
            'end_date'            => $validated['end_date'] ?? null,
            'is_active'           => $validated['is_active'] ?? true,
            'min_purchase_amount' => $validated['min_purchase_amount'] ?? null,
            'usage_limit'         => $validated['usage_limit'] ?? null,
            'promo_code'          => $validated['promo_code'] ?? null,
            'priority'            => $validated['priority'] ?? 0,
            'image_path'          => $imagePath,
        ]);

        // Sync products
        $syncData = [];
        foreach ($validated['products'] as $product) {
            $syncData[$product['id']] = [
                'quantity'          => $product['quantity'],
                'discount_override' => $product['discount_override'] ?? null,
            ];
        }
        $promotion->products()->sync($syncData);

        return redirect()->route('promotions.index')
            ->with('success', 'Promotion updated successfully.');
    }

    /* ─────────────────────────────────────────────────
       DESTROY — Delete promotion
       ───────────────────────────────────────────────── */
    public function destroy(Promotion $promotion): RedirectResponse
    {
        // Delete image if exists
        if ($promotion->image_path) {
            Storage::disk('public')->delete($promotion->image_path);
        }

        $promotion->delete();

        return redirect()->route('promotions.index')
            ->with('success', 'Promotion deleted successfully.');
    }

    /* ─────────────────────────────────────────────────
       TOGGLE — Toggle active status
       ───────────────────────────────────────────────── */
    public function toggle(Promotion $promotion): RedirectResponse
    {
        $promotion->update(['is_active' => !$promotion->is_active]);

        return redirect()->route('promotions.index')
            ->with('success', 'Promotion ' . ($promotion->is_active ? 'activated' : 'deactivated') . ' successfully.');
    }

    /* ─────────────────────────────────────────────────
       ACTIVE — Get active promotions for POS
       ───────────────────────────────────────────────── */
    public function active(): JsonResponse
    {
        $promotions = Promotion::with('products')
            ->active()
            ->orderBy('priority', 'desc')
            ->get();

        return response()->json(PromotionResource::collection($promotions));
    }
}
