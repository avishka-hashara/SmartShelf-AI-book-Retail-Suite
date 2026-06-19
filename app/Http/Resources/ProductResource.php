<?php

// app/Http/Resources/ProductResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'brand'               => $this->brand,
            'sku'                 => $this->sku,
            'category'            => $this->category,
            'category_label'      => $this->category_label,
            'description'         => $this->description,
            'unit_price'          => (float) $this->unit_price,
            'formatted_price'     => $this->formatted_price,
            'cost_price'          => $this->cost_price ? (float) $this->cost_price : null,
            'margin_percentage'   => $this->margin_percentage,
            'stock_level'         => $this->stock_level,
            'low_stock_threshold' => $this->low_stock_threshold,
            'status'              => $this->status,
            'status_label'        => $this->status_label,
            'image_path'          => $this->image_path,
            'image_url'           => $this->image_path
                                        ? Storage::disk('public')->url($this->image_path)
                                        : null,
            'added_by'            => $this->added_by,
            'custom_attributes'   => $this->custom_attributes,
            'created_at'          => $this->created_at?->toISOString(),
            'updated_at'          => $this->updated_at?->toISOString(),
        ];
    }
}