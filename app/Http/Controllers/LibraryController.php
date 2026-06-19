<?php

// app/Http/Controllers/LibraryController.php

namespace App\Http\Controllers;

use App\Models\LibraryBook;
use App\Models\LibraryLoan;
use App\Models\LibraryMember;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LibraryController extends Controller
{
    /* ─────────────────────────────────────────────────
       INDEX — Main library page
       ───────────────────────────────────────────────── */
    public function index(Request $request): Response
    {
        $bookSearch   = $request->input('book_search');
        $memberSearch = $request->input('member_search');
        $loanStatus   = $request->input('loan_status', 'all');

        // ── Auto-flag overdue loans FIRST so the query below sees correct statuses ──
        LibraryLoan::where('status', 'active')
            ->whereDate('due_date', '<', Carbon::today())
            ->update(['status' => 'overdue']);

        $books = LibraryBook::query()
            ->when($bookSearch, fn ($q) => $q->search($bookSearch))
            ->withCount(['activeLoans'])
            ->latest()
            ->paginate(12, ['*'], 'books_page')
            ->withQueryString();

        $members = LibraryMember::query()
            ->when($memberSearch, fn ($q) => $q->search($memberSearch))
            ->withCount(['activeLoans'])
            ->orderBy('name')
            ->paginate(10, ['*'], 'members_page')
            ->withQueryString();

        $loans = LibraryLoan::with(['book', 'member'])
            ->when($loanStatus !== 'all', fn ($q) => $q->where('status', $loanStatus))
            ->latest()
            ->paginate(15, ['*'], 'loans_page')
            ->withQueryString();

        $stats = [
            'total_books'     => LibraryBook::sum('total_copies'),
            'available_books' => LibraryBook::sum('available_copies'),
            'active_loans'    => LibraryLoan::whereIn('status', ['active', 'overdue'])->count(),
            'overdue_loans'   => LibraryLoan::where('status', 'overdue')->count(),
            'total_members'   => LibraryMember::where('status', 'active')->count(),
        ];

        // ── Revenue / Earnings breakdown ──────────────────────────────────────

        // Lending income: for completed loans, calculate daily_rate × actual days loaned
        // (return_date - loan_date). This is the PRIMARY revenue from running the library.
        $completedLoans = LibraryLoan::whereIn('status', ['returned', 'lost', 'damaged'])
                            ->whereNotNull('return_date')
                            ->get(['loan_date', 'return_date', 'daily_rate', 'late_fine', 'extra_fee',
                                   'library_book_id', 'status']);

        $lendingTotal = $completedLoans->sum(function ($loan) {
            $days = max(1, Carbon::parse($loan->loan_date)->diffInDays(Carbon::parse($loan->return_date)));
            return round($days * (float) $loan->daily_rate, 2);
        });

        $revenue = [
            // ── Lending income (daily rate × days) ──
            'lending_total'       => round($lendingTotal, 2),
            'lending_count'       => $completedLoans->count(),

            // ── Fines collected from late returns ──
            'late_fines_total'    => (float) LibraryLoan::where('status', 'returned')->sum('late_fine'),
            'late_fines_count'    => LibraryLoan::where('status', 'returned')->where('late_fine', '>', 0)->count(),

            // ── Lost book fees ──
            'lost_fees_total'     => (float) LibraryLoan::where('status', 'lost')->sum('extra_fee'),
            'lost_fees_count'     => LibraryLoan::where('status', 'lost')->count(),

            // ── Damage fees ──
            'damage_fees_total'   => (float) LibraryLoan::where('status', 'damaged')->sum('extra_fee'),
            'damage_fees_count'   => LibraryLoan::where('status', 'damaged')->count(),

            // ── Deposits currently held (refundable — not income) ──
            'deposits_held'       => (float) LibraryLoan::whereIn('status', ['active', 'overdue'])->sum('deposit_amount'),

            // ── Monthly breakdown (last 6 months) including lending ──
            'monthly'             => LibraryLoan::selectRaw("
                                        DATE_FORMAT(return_date, '%Y-%m') as month,
                                        SUM(DATEDIFF(return_date, loan_date) * daily_rate) as lending,
                                        SUM(late_fine) as fines,
                                        SUM(extra_fee) as incident_fees,
                                        COUNT(*) as transactions
                                    ")
                                    ->whereIn('status', ['returned', 'lost', 'damaged'])
                                    ->whereNotNull('return_date')
                                    ->where('return_date', '>=', Carbon::now()->subMonths(6)->startOfMonth())
                                    ->groupBy('month')
                                    ->orderBy('month')
                                    ->get(),

            // ── Top earning books (lending + fines) ──
            'top_books'           => LibraryLoan::selectRaw("
                                        library_book_id,
                                        SUM(DATEDIFF(return_date, loan_date) * daily_rate) as lending_earned,
                                        SUM(late_fine) as fines_earned,
                                        COUNT(*) as total_loans,
                                        SUM(CASE WHEN late_fine > 0 THEN 1 ELSE 0 END) as late_returns
                                    ")
                                    ->whereIn('status', ['returned', 'lost', 'damaged'])
                                    ->whereNotNull('return_date')
                                    ->with('book:id,title,author')
                                    ->groupBy('library_book_id')
                                    ->orderByRaw('SUM(DATEDIFF(return_date, loan_date) * daily_rate) + SUM(late_fine) DESC')
                                    ->limit(5)
                                    ->get(),

            // ── Pending lending fees from active loans (not yet collected) ──
            'pending_lending'     => (float) LibraryLoan::whereIn('status', ['active', 'overdue'])
                                    ->get()
                                    ->sum(function ($loan) {
                                        $days = max(1, Carbon::parse($loan->loan_date)->diffInDays(now()));
                                        return round($days * (float) $loan->daily_rate, 2);
                                    }),

            // ── Pending overdue fines (not yet collected) ──
            'pending_fines'       => (float) LibraryLoan::where('status', 'overdue')
                                    ->get()
                                    ->sum(function ($loan) {
                                        $days = max(0, Carbon::parse($loan->due_date)->diffInDays(now(), false) * -1);
                                        return round($days * (float) $loan->daily_rate * 1.5, 2);
                                    }),
        ];

        return Inertia::render('Library/Index', [
            'books'   => $books,
            'members' => $members,
            'loans'   => $loans,
            'stats'   => $stats,
            'revenue' => $revenue,
            'filters' => $request->only(['book_search', 'member_search', 'loan_status']),
        ]);
    }

    /* ─────────────────────────────────────────────────
       BOOKS — Store
       ───────────────────────────────────────────────── */
    public function storeBook(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'          => ['required', 'string', 'max:255'],
            'author'         => ['required', 'string', 'max:255'],
            'isbn'           => ['nullable', 'string', 'max:20', 'unique:library_books,isbn'],
            'genre'          => ['nullable', 'string', 'max:100'],
            'description'    => ['nullable', 'string', 'max:2000'],
            'publisher'      => ['nullable', 'string', 'max:255'],
            'published_year' => ['nullable', 'string', 'max:4'],
            'total_copies'   => ['required', 'integer', 'min:1'],
            'daily_rate'     => ['required', 'numeric', 'min:0'],
            'deposit_amount' => ['required', 'numeric', 'min:0'],
            'lost_fee'       => ['nullable', 'numeric', 'min:0'],
            'damage_fee'     => ['nullable', 'numeric', 'min:0'],
            'image'          => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('library/books', 'public');
        }
        unset($validated['image']);

        $validated['available_copies'] = $validated['total_copies'];
        $validated['added_by']         = auth()->user()->name ?? 'Staff';
        $validated['status']           = 'available';

        LibraryBook::create($validated);

        // Explicit redirect — back() relies on Referer header which Inertia SPA
        // navigation doesn't always set reliably, causing the "stuck UI" problem.
        return redirect()->route('library.index')
            ->with('success', 'Book added to the library successfully.');
    }

    /* ─────────────────────────────────────────────────
       BOOKS — Update
       ───────────────────────────────────────────────── */
    public function updateBook(Request $request, int $id): RedirectResponse
    {
        $book = LibraryBook::findOrFail($id);

        $validated = $request->validate([
            'title'          => ['required', 'string', 'max:255'],
            'author'         => ['required', 'string', 'max:255'],
            'isbn'           => ['nullable', 'string', 'max:20', "unique:library_books,isbn,{$id}"],
            'genre'          => ['nullable', 'string', 'max:100'],
            'description'    => ['nullable', 'string', 'max:2000'],
            'publisher'      => ['nullable', 'string', 'max:255'],
            'published_year' => ['nullable', 'string', 'max:4'],
            'total_copies'   => ['required', 'integer', 'min:1'],
            'daily_rate'     => ['required', 'numeric', 'min:0'],
            'deposit_amount' => ['required', 'numeric', 'min:0'],
            'lost_fee'       => ['nullable', 'numeric', 'min:0'],
            'damage_fee'     => ['nullable', 'numeric', 'min:0'],
            'image'          => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            if ($book->image_path) {
                Storage::disk('public')->delete($book->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('library/books', 'public');
        }
        unset($validated['image']);

        // Adjust available copies proportionally when total_copies changes
        $copyDiff = (int) $validated['total_copies'] - $book->total_copies;
        $validated['available_copies'] = max(0, $book->available_copies + $copyDiff);

        // Re-derive status based on updated available_copies
        $validated['status'] = $validated['available_copies'] > 0 ? 'available' : 'unavailable';

        $book->update($validated);

        return redirect()->route('library.index')
            ->with('success', 'Book updated successfully.');
    }

    /* ─────────────────────────────────────────────────
       BOOKS — Destroy
       ───────────────────────────────────────────────── */
    public function destroyBook(int $id): RedirectResponse
    {
        $book = LibraryBook::findOrFail($id);

        if ($book->activeLoans()->exists()) {
            return redirect()->route('library.index')
                ->with('error', 'Cannot delete a book with active loans.');
        }

        if ($book->image_path) {
            Storage::disk('public')->delete($book->image_path);
        }
        $book->delete();

        return redirect()->route('library.index')
            ->with('success', 'Book removed from library.');
    }

    /* ─────────────────────────────────────────────────
       MEMBERS — Store
       ───────────────────────────────────────────────── */
    public function storeMember(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['nullable', 'email', 'max:255', 'unique:library_members,email'],
            'phone'   => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        // Auto-generate member ID
        $last    = LibraryMember::orderByDesc('id')->value('member_id');
        $nextNum = $last ? (int) ltrim(str_replace('MEM-', '', $last), '0') + 1 : 1;

        LibraryMember::create([
            ...$validated,
            'member_id' => 'MEM-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT),
            'status'    => 'active',
            'joined_at' => now(),
            'added_by'  => auth()->user()->name ?? 'Staff',
        ]);

        return redirect()->route('library.index')
            ->with('success', 'Library member added successfully.');
    }

    /* ─────────────────────────────────────────────────
       MEMBERS — Update
       ───────────────────────────────────────────────── */
    public function updateMember(Request $request, int $id): RedirectResponse
    {
        $member = LibraryMember::findOrFail($id);

        $validated = $request->validate([
            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['nullable', 'email', 'max:255', "unique:library_members,email,{$id}"],
            'phone'   => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'status'  => ['sometimes', 'in:active,suspended'],
        ]);

        $member->update($validated);

        return redirect()->route('library.index')
            ->with('success', 'Member updated successfully.');
    }

    /* ─────────────────────────────────────────────────
       LOANS — Issue
       ───────────────────────────────────────────────── */
    public function issueLoan(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'library_book_id'   => ['required', 'exists:library_books,id'],
            'library_member_id' => ['required', 'exists:library_members,id'],
            'loan_date'         => ['required', 'date'],
            'due_date'          => ['required', 'date', 'after:loan_date'],
            'notes'             => ['nullable', 'string', 'max:500'],
        ]);

        $book   = LibraryBook::findOrFail($validated['library_book_id']);
        $member = LibraryMember::findOrFail($validated['library_member_id']);

        if (!$book->is_available) {
            return redirect()->route('library.index')
                ->with('error', 'This book is not available for lending.');
        }

        if ($member->status !== 'active') {
            return redirect()->route('library.index')
                ->with('error', 'This member is suspended and cannot borrow books.');
        }

        LibraryLoan::create([
            ...$validated,
            'issued_by'      => auth()->user()->name ?? 'Staff',
            'status'         => 'active',
            'daily_rate'     => $book->daily_rate,
            'deposit_amount' => $book->deposit_amount,
        ]);

        // Decrement then REFRESH the model so available_copies reflects the
        // new DB value before we check it for status update.
        $book->decrement('available_copies');
        $book->refresh();

        if ($book->available_copies <= 0) {
            $book->update(['status' => 'unavailable']);
        }

        return redirect()->route('library.index')
            ->with('success', "Book issued to {$member->name} successfully.");
    }

    /* ─────────────────────────────────────────────────
       LOANS — Return
       ───────────────────────────────────────────────── */
    public function returnLoan(Request $request, int $id): RedirectResponse
    {
        $loan = LibraryLoan::with('book')->findOrFail($id);

        if (!in_array($loan->status, ['active', 'overdue'])) {
            return redirect()->route('library.index')
                ->with('error', 'This loan is already closed.');
        }

        $validated = $request->validate([
            'return_date'    => ['required', 'date'],
            'late_fine'      => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['required', 'in:cash,card,none'],
            'notes'          => ['nullable', 'string', 'max:500'],
        ]);

        $returnDate  = Carbon::parse($validated['return_date']);
        $dueDate     = Carbon::parse($loan->due_date);
        // diffInDays with false = signed diff; negative means returned early
        $overdueDays = max(0, (int) $dueDate->diffInDays($returnDate, false));
        // Calculate default fine if not provided
        $defaultFine = $overdueDays > 0
            ? round($overdueDays * (float) $loan->daily_rate * 1.5, 2)
            : 0;
        // Use provided late_fine or fallback to calculated
        $lateFine = isset($validated['late_fine']) ? (float) $validated['late_fine'] : $defaultFine;

        $loan->update([
            'return_date'    => $returnDate->toDateString(),
            'status'         => 'returned',
            'late_fine'      => $lateFine,
            'total_charged'  => $lateFine,
            'payment_method' => $validated['payment_method'],
            'notes'          => $validated['notes'] ?? $loan->notes,
        ]);

        // Increment then REFRESH before deriving status
        $loan->book->increment('available_copies');
        $loan->book->refresh();
        $loan->book->update(['status' => 'available']);

        $msg = 'Book returned successfully.';
        if ($lateFine > 0) {
            $msg .= " Late fine collected: Rs. {$lateFine}";
        }

        return redirect()->route('library.index')->with('success', $msg);
    }

    /* ─────────────────────────────────────────────────
       LOANS — Extend
       ───────────────────────────────────────────────── */
    public function extendLoan(Request $request, int $id): RedirectResponse
    {
        $loan = LibraryLoan::findOrFail($id);

        if (!in_array($loan->status, ['active', 'overdue'])) {
            return redirect()->route('library.index')
                ->with('error', 'Cannot extend a closed loan.');
        }

        $validated = $request->validate([
            'extension_days' => ['required', 'integer', 'min:1', 'max:90'],
            'notes'          => ['nullable', 'string', 'max:500'],
        ]);

        $newDueDate = Carbon::parse($loan->due_date)->addDays((int) $validated['extension_days']);

        $loan->update([
            'due_date'       => $newDueDate->toDateString(),
            'extension_days' => $loan->extension_days + (int) $validated['extension_days'],
            'extended_by'    => auth()->user()->name ?? 'Staff',
            'extended_at'    => now(),
            // Extending reactivates an overdue loan
            'status'         => 'active',
            'notes'          => $validated['notes'] ?? $loan->notes,
        ]);

        return redirect()->route('library.index')
            ->with('success', "Loan extended by {$validated['extension_days']} days. New due date: {$newDueDate->format('d M Y')}.");
    }

    /* ─────────────────────────────────────────────────
       LOANS — Mark Lost / Damaged
       ───────────────────────────────────────────────── */
    public function markIncident(Request $request, int $id): RedirectResponse
    {
        $loan = LibraryLoan::with('book')->findOrFail($id);

        if (!in_array($loan->status, ['active', 'overdue'])) {
            return redirect()->route('library.index')
                ->with('error', 'This loan is already closed.');
        }

        $validated = $request->validate([
            'incident_type'  => ['required', 'in:lost,damaged'],
            'payment_method' => ['required', 'in:cash,card,none'],
            'notes'          => ['nullable', 'string', 'max:500'],
        ]);

        $extraFee = $validated['incident_type'] === 'lost'
            ? (float) $loan->book->lost_fee
            : (float) $loan->book->damage_fee;

        $loan->update([
            'status'         => $validated['incident_type'],
            'return_date'    => now()->toDateString(),
            'extra_fee'      => $extraFee,
            'total_charged'  => $extraFee,
            'payment_method' => $validated['payment_method'],
            'notes'          => $validated['notes'] ?? $loan->notes,
        ]);

        if ($validated['incident_type'] === 'lost') {
            // Lost = copy permanently gone; reduce total inventory count
            $loan->book->decrement('total_copies');
            $loan->book->refresh();
            $loan->book->update([
                'status' => $loan->book->available_copies > 0 ? 'available' : 'unavailable',
            ]);
        } else {
            // Damaged but returned — copy is back on the shelf
            $loan->book->increment('available_copies');
            $loan->book->refresh();
            $loan->book->update(['status' => 'available']);
        }

        return redirect()->route('library.index')
            ->with('success', ucfirst($validated['incident_type']) . " incident recorded. Fee: Rs. {$extraFee}.");
    }

    /* ─────────────────────────────────────────────────
       LOAN FEE PREVIEW (JSON)
       ───────────────────────────────────────────────── */
    public function previewFee(Request $request): JsonResponse
    {
        $loan       = LibraryLoan::with('book')->findOrFail($request->input('loan_id'));
        $returnDate = Carbon::parse($request->input('return_date', now()->toDateString()));

        $overdueDays = max(0, (int) Carbon::parse($loan->due_date)->diffInDays($returnDate, false));
        $lateFine    = $overdueDays > 0
            ? round($overdueDays * (float) $loan->daily_rate * 1.5, 2)
            : 0;

        return response()->json([
            'overdue_days'   => $overdueDays,
            'late_fine'      => $lateFine,
            'deposit_amount' => (float) $loan->deposit_amount,
            'daily_rate'     => (float) $loan->daily_rate,
        ]);
    }
}