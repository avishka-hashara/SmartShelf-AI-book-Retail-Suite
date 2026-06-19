<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = ProductCategory::orderBy('name')->get();
        return Inertia::render('Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        ProductCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'custom_fields' => $validated['custom_fields'] ?? [],
            'is_system' => false,
        ]);

        return redirect()->route('categories.index')->with('success', 'Category created successfully.');
    }

    public function updateFields(Request $request, string $slug): RedirectResponse
    {
        $request->validate([
            'custom_fields' => ['nullable', 'array'],
            'custom_fields.*.key' => ['required', 'string', 'regex:/^[a-z0-9_]+$/'],
            'custom_fields.*.label' => ['required', 'string'],
            'custom_fields.*.type' => ['required', 'in:text,number,textarea,select'],
            'custom_fields.*.required' => ['nullable', 'boolean'],
            'custom_fields.*.options' => ['array', 'required_if:custom_fields.*.type,select'],
        ]);

        $category = ProductCategory::where('slug', $slug)->firstOrFail();
        
        $category->custom_fields = $request->input('custom_fields') ?? [];
        $category->save();

        return redirect()->route('categories.index')->with('success', 'Category fields updated successfully.');
    }

    public function destroy(string $slug): RedirectResponse
    {
        $category = ProductCategory::where('slug', $slug)->firstOrFail();

        if ($category->is_system) {
            return redirect()->route('categories.index')->with('error', 'Cannot delete a system category.');
        }

        if (\App\Models\Product::where('category', $slug)->exists()) {
             return redirect()->route('categories.index')->with('error', 'Cannot delete a category that has associated products.');
        }

        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Category deleted successfully.');
    }
}
