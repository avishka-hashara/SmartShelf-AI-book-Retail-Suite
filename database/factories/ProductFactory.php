<?php

// database/factories/ProductFactory.php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $stock     = $this->faker->numberBetween(0, 100);
        $threshold = 10;

        return [
            'name'                => $this->faker->words(3, true),
            'brand'               => $this->faker->company(),
            'sku'                 => strtoupper($this->faker->unique()->bothify('???-####-??')),
            'category'            => $this->faker->randomElement(['books', 'stationery', 'school_accessories']),
            'description'         => $this->faker->optional()->sentence(),
            'unit_price'          => $this->faker->randomFloat(2, 100, 5000),
            'cost_price'          => $this->faker->optional()->randomFloat(2, 50, 3000),
            'stock_level'         => $stock,
            'low_stock_threshold' => $threshold,
            // status is auto-derived via model boot — no need to set here
            'image_path'          => null,
            'added_by'            => $this->faker->name(),
        ];
    }

    /** State: force in-stock */
    public function inStock(): static
    {
        return $this->state(['stock_level' => 50, 'low_stock_threshold' => 10]);
    }

    /** State: force low-stock */
    public function lowStock(): static
    {
        return $this->state(['stock_level' => 5, 'low_stock_threshold' => 10]);
    }

    /** State: force out-of-stock */
    public function outOfStock(): static
    {
        return $this->state(['stock_level' => 0, 'low_stock_threshold' => 10]);
    }

    /** State: books category */
    public function book(): static
    {
        return $this->state(['category' => 'books']);
    }
}