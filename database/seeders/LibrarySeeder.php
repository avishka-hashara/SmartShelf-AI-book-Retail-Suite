<?php

// database/seeders/LibrarySeeder.php

namespace Database\Seeders;

use App\Models\LibraryBook;
use App\Models\LibraryMember;
use App\Models\LibraryLoan;
use Illuminate\Database\Seeder;

class LibrarySeeder extends Seeder
{
    public function run(): void
    {
        // ── Books ─────────────────────────────────────────────────────────────
        $books = [
            [
                'title'          => 'To Kill a Mockingbird',
                'author'         => 'Harper Lee',
                'isbn'           => '978-0061935466',
                'genre'          => 'Fiction',
                'description'    => 'A novel about racial injustice and childhood innocence in the American South.',
                'publisher'      => 'Harper Perennial',
                'published_year' => '1960',
                'total_copies'   => 3,
                'available_copies' => 2,
                'daily_rate'     => 25.00,
                'deposit_amount' => 300.00,
                'lost_fee'       => 1500.00,
                'damage_fee'     => 500.00,
            ],
            [
                'title'          => 'The Alchemist',
                'author'         => 'Paulo Coelho',
                'isbn'           => '978-0062315007',
                'genre'          => 'Fiction',
                'description'    => 'A magical fable about following your dream.',
                'publisher'      => 'HarperOne',
                'published_year' => '1988',
                'total_copies'   => 4,
                'available_copies' => 4,
                'daily_rate'     => 20.00,
                'deposit_amount' => 250.00,
                'lost_fee'       => 1200.00,
                'damage_fee'     => 400.00,
            ],
            [
                'title'          => 'Dune',
                'author'         => 'Frank Herbert',
                'isbn'           => '978-0441013593',
                'genre'          => 'Science',
                'description'    => 'An epic saga of a desert planet, ecology, and political intrigue.',
                'publisher'      => 'Ace Books',
                'published_year' => '1965',
                'total_copies'   => 2,
                'available_copies' => 1,
                'daily_rate'     => 30.00,
                'deposit_amount' => 400.00,
                'lost_fee'       => 2000.00,
                'damage_fee'     => 600.00,
            ],
            [
                'title'          => 'A Brief History of Time',
                'author'         => 'Stephen Hawking',
                'isbn'           => '978-0553380163',
                'genre'          => 'Science',
                'description'    => 'Explores cosmology, black holes, and the nature of the universe.',
                'publisher'      => 'Bantam Books',
                'published_year' => '1988',
                'total_copies'   => 2,
                'available_copies' => 2,
                'daily_rate'     => 35.00,
                'deposit_amount' => 450.00,
                'lost_fee'       => 2500.00,
                'damage_fee'     => 700.00,
            ],
            [
                'title'          => 'The Lean Startup',
                'author'         => 'Eric Ries',
                'isbn'           => '978-0307887894',
                'genre'          => 'Technology',
                'description'    => 'How today\'s entrepreneurs use continuous innovation.',
                'publisher'      => 'Crown Business',
                'published_year' => '2011',
                'total_copies'   => 2,
                'available_copies' => 2,
                'daily_rate'     => 40.00,
                'deposit_amount' => 500.00,
                'lost_fee'       => 3000.00,
                'damage_fee'     => 800.00,
            ],
        ];

        foreach ($books as $b) {
            LibraryBook::create([...$b, 'status' => $b['available_copies'] > 0 ? 'available' : 'unavailable', 'added_by' => 'Admin']);
        }

        // ── Members ───────────────────────────────────────────────────────────
        $members = [
            ['name' => 'Anika Perera',   'email' => 'anika@example.com',   'phone' => '+94 71 234 5678', 'member_id' => 'MEM-001'],
            ['name' => 'Roshan Fernando', 'email' => 'roshan@example.com', 'phone' => '+94 77 876 5432', 'member_id' => 'MEM-002'],
            ['name' => 'Dilini Jayawardena', 'email' => 'dilini@example.com', 'phone' => '+94 76 543 2109', 'member_id' => 'MEM-003'],
        ];

        foreach ($members as $m) {
            LibraryMember::create([...$m, 'status' => 'active', 'joined_at' => now()->subMonths(rand(1, 12)), 'added_by' => 'Admin']);
        }

        // ── Sample Loan ───────────────────────────────────────────────────────
        $book   = LibraryBook::first();
        $member = LibraryMember::first();

        if ($book && $member) {
            LibraryLoan::create([
                'library_book_id'   => $book->id,
                'library_member_id' => $member->id,
                'issued_by'         => 'Admin',
                'loan_date'         => now()->subDays(5)->toDateString(),
                'due_date'          => now()->addDays(9)->toDateString(),
                'status'            => 'active',
                'daily_rate'        => $book->daily_rate,
                'deposit_amount'    => $book->deposit_amount,
            ]);
            $book->decrement('available_copies');
        }
    }
}