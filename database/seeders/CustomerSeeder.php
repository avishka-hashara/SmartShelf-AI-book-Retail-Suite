<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class CustomerSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $customers = [
            [
                'name'            => 'Jane Cooper',
                'email'           => 'jane.cooper@example.com',
                'phone'           => '+1 (555) 201-1122',
                'status'          => 'Active',
                'total_purchases' => 1240.50,
                'orders'          => 18,
                'last_visit'      => '2026-02-18',
                'loyalty_pts'     => 620,
            ],
            [
                'name'            => 'Cody Fisher',
                'email'           => 'cody.fisher@example.com',
                'phone'           => '+1 (555) 303-4455',
                'status'          => 'Active',
                'total_purchases' => 875.00,
                'orders'          => 11,
                'last_visit'      => '2026-02-15',
                'loyalty_pts'     => 437,
            ],
            [
                'name'            => 'Esther Howard',
                'email'           => 'esther.howard@example.com',
                'phone'           => '+1 (555) 405-6677',
                'status'          => 'Inactive',
                'total_purchases' => 340.00,
                'orders'          => 5,
                'last_visit'      => '2025-12-20',
                'loyalty_pts'     => 170,
            ],
            [
                'name'            => 'Cameron Williamson',
                'email'           => 'cameron.w@example.com',
                'phone'           => '+1 (555) 507-8899',
                'status'          => 'Active',
                'total_purchases' => 2150.75,
                'orders'          => 30,
                'last_visit'      => '2026-02-19',
                'loyalty_pts'     => 1075,
            ],
            [
                'name'            => 'Brooklyn Simmons',
                'email'           => 'brooklyn.s@example.com',
                'phone'           => '+1 (555) 609-0011',
                'status'          => 'Active',
                'total_purchases' => 510.25,
                'orders'          => 7,
                'last_visit'      => '2026-01-30',
                'loyalty_pts'     => 255,
            ],
            [
                'name'            => 'Leslie Alexander',
                'email'           => 'leslie.alexander@example.com',
                'phone'           => '+1 (555) 711-2233',
                'status'          => 'Active',
                'total_purchases' => 3890.00,
                'orders'          => 47,
                'last_visit'      => '2026-02-17',
                'loyalty_pts'     => 1945,
            ],
            [
                'name'            => 'Floyd Miles',
                'email'           => 'floyd.miles@example.com',
                'phone'           => '+1 (555) 813-4455',
                'status'          => 'Inactive',
                'total_purchases' => 125.00,
                'orders'          => 2,
                'last_visit'      => '2025-11-05',
                'loyalty_pts'     => 62,
            ],
            [
                'name'            => 'Savannah Nguyen',
                'email'           => 'savannah.n@example.com',
                'phone'           => '+1 (555) 915-6677',
                'status'          => 'Active',
                'total_purchases' => 720.00,
                'orders'          => 9,
                'last_visit'      => '2026-02-10',
                'loyalty_pts'     => 360,
            ],
            [
                'name'            => 'Dianne Russell',
                'email'           => 'dianne.russell@example.com',
                'phone'           => '+1 (555) 017-8899',
                'status'          => 'Active',
                'total_purchases' => 1580.00,
                'orders'          => 21,
                'last_visit'      => '2026-02-14',
                'loyalty_pts'     => 790,
            ],
            [
                'name'            => 'Guy Hawkins',
                'email'           => 'guy.hawkins@example.com',
                'phone'           => '+1 (555) 119-0011',
                'status'          => 'Active',
                'total_purchases' => 240.50,
                'orders'          => 4,
                'last_visit'      => '2026-02-05',
                'loyalty_pts'     => 120,
            ],
        ];

        foreach ($customers as $index => $data) {
            $customer = Customer::create($data);
            $customer->customer_code = 'CUS-' . str_pad($customer->id + 1000, 4, '0', STR_PAD_LEFT);
            $customer->save();
        }

        $this->command->info('✅ Seeded ' . count($customers) . ' customers.');
    }
}
