<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Books',
                'slug' => 'books',
                'is_system' => true,
                'custom_fields' => [
                    [
                        'key' => 'author',
                        'label' => 'Author',
                        'type' => 'text',
                        'required' => true,
                    ],
                    [
                        'key' => 'publisher',
                        'label' => 'Publisher',
                        'type' => 'text',
                        'required' => false,
                    ],
                    [
                        'key' => 'isbn',
                        'label' => 'ISBN',
                        'type' => 'text',
                        'required' => false,
                    ],
                    [
                        'key' => 'pages',
                        'label' => 'Pages',
                        'type' => 'number',
                        'required' => false,
                    ]
                ]
            ],
            [
                'name' => 'Stationery',
                'slug' => 'stationery',
                'is_system' => true,
                'custom_fields' => []
            ],
            [
                'name' => 'School Accessories',
                'slug' => 'school_accessories',
                'is_system' => true,
                'custom_fields' => []
            ]
        ];

        foreach ($categories as $category) {
            ProductCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
