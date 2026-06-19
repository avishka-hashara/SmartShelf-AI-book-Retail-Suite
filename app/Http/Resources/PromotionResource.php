<?php

// app/Http/Resources/PromotionResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PromotionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'name'                  => $this->name,
            'description'           => $this->description,
            'type'                  => $this->type,
            'type_label'            => ucfirst($this->type),
            'discount_type'         => $this->discount_type,
            'discount_value'        => (float) $this->discount_value,
            'bundle_price'          => $this->bundle_price ? (float) $this->bundle_price : null,
            'original_price'        => (float) $this->original_price,
            'final_price'           => (float) $this->final_price,
            'savings'               => (float) $this->savings,
            'formatted_price'       => $this->formatted_price,
            'formatted_original_price' => $this->formatted_original_price,
            'formatted_savings'     => $this->formatted_savings,
            'start_date'            => $this->start_date?->format('Y-m-d'),
            'end_date'              => $this->end_date?->format('Y-m-d'),
            'is_active'             => $this->is_active,
            'is_valid'              => $this->isValid(),
            'status_label'          => $this->status_label,
            'min_purchase_amount'   => $this->min_purchase_amount ? (float) $this->min_purchase_amount : null,
            'usage_limit'           => $this->usage_limit,
            'times_used'            => $this->times_used,
            'promo_code'            => $this->promo_code,
            'priority'              => $this->priority,
            'image_path'            => $this->image_path,
            'image_url'             => $this->image_path
                                          ? Storage::disk('public')->url($this->image_path)
                                          : null,
            'created_by'            => $this->created_by,
            'created_at'            => $this->created_at?->toISOString(),
            'updated_at'            => $this->updated_at?->toISOString(),
            
            // Include products with their details
            'products'              => $this->whenLoaded('products', function () {
                return $this->products->map(function ($product) {
                    return [
                        'id'          => $product->id,
                        'name'        => $product->name,
                        'brand'       => $product->brand,
                        'sku'         => $product->sku,
                        'category'    => $product->category,
                        'unit_price'  => (float) $product->unit_price,
                        'stock_level' => $product->stock_level,
                        'image_path'  => $product->image_path,
                        'quantity'    => $product->pivot->quantity,
                        'discount_override' => $product->pivot->discount_override 
                            ? (float) $product->pivot->discount_override 
                            : null,
                    ];
                });
            }),
        ];
    }
}
