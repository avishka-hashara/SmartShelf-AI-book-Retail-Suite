<?php

// database/migrations/2026_02_20_000002_create_library_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Library Books ────────────────────────────────────────────────────────
        Schema::create('library_books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('author');
            $table->string('isbn')->unique()->nullable();
            $table->string('genre', 100)->nullable();
            $table->text('description')->nullable();
            $table->string('publisher')->nullable();
            $table->string('published_year', 4)->nullable();
            $table->integer('total_copies')->default(1);
            $table->integer('available_copies')->default(1);
            $table->decimal('daily_rate', 8, 2)->default(0);          // lending fee per day
            $table->decimal('deposit_amount', 8, 2)->default(0);      // refundable deposit
            $table->decimal('lost_fee', 8, 2)->default(0);            // fee if book is lost
            $table->decimal('damage_fee', 8, 2)->default(0);          // fee if book is damaged
            $table->enum('status', ['available', 'unavailable'])->default('available');
            $table->string('image_path')->nullable();
            $table->string('added_by');
            $table->timestamps();
        });

        // ── Library Members ──────────────────────────────────────────────────────
        Schema::create('library_members', function (Blueprint $table) {
            $table->id();
            $table->string('member_id')->unique();                      // e.g. MEM-001
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->enum('status', ['active', 'suspended'])->default('active');
            $table->timestamp('joined_at')->nullable();
            $table->string('added_by');
            $table->timestamps();
        });

        // ── Library Loans ────────────────────────────────────────────────────────
        Schema::create('library_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('library_book_id')->constrained('library_books')->restrictOnDelete();
            $table->foreignId('library_member_id')->constrained('library_members')->restrictOnDelete();
            $table->string('issued_by');                                // staff name
            $table->date('loan_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->integer('extension_days')->default(0);
            $table->string('extended_by')->nullable();                  // staff who extended
            $table->timestamp('extended_at')->nullable();
            $table->enum('status', ['active', 'returned', 'overdue', 'lost', 'damaged'])->default('active');
            $table->decimal('daily_rate', 8, 2)->default(0);
            $table->decimal('deposit_amount', 8, 2)->default(0);
            $table->decimal('late_fine', 8, 2)->default(0);
            $table->decimal('extra_fee', 8, 2)->default(0);            // lost / damage fee
            $table->decimal('total_charged', 8, 2)->default(0);
            $table->enum('payment_method', ['cash', 'card', 'none'])->default('none');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_loans');
        Schema::dropIfExists('library_members');
        Schema::dropIfExists('library_books');
    }
};