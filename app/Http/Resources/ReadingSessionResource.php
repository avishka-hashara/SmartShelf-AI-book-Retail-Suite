<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReadingSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_name' => $this->customer_name ?? 'Guest',
            'seat_number' => $this->seat_number,
            'check_in_at' => $this->check_in_at ? $this->check_in_at->toIso8601String() : null,
            'check_out_at' => $this->check_out_at ? $this->check_out_at->toIso8601String() : null,
            'duration_minutes' => $this->duration_minutes,
            'duration_formatted' => $this->formatted_duration,
            'billed_units' => $this->billed_units,
            'hourly_rate' => $this->hourly_rate,
            'total_amount' => $this->total_amount,
            'total_formatted' => $this->formatted_total,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'served_by' => $this->served_by,

            // Live data if present dynamically added via service method
            'minutes_elapsed' => $this->minutes_elapsed ?? null,
            'running_total' => $this->running_total ?? null,
        ];
    }
}
