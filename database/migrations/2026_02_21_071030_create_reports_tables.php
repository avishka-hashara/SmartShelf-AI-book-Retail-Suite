<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('saved_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('type'); // sales, inventory, customer, etc.
            $table->json('filters');
            $table->json('configuration')->nullable(); // charts, visible columns, etc.
            $table->timestamps();
        });

        Schema::create('scheduled_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('saved_report_id')->constrained('saved_reports')->onDelete('cascade');
            $table->string('frequency'); // daily, weekly, monthly
            $table->string('delivery_time'); // HH:mm
            $table->json('recipients'); // array of emails
            $table->string('format')->default('pdf'); // pdf, csv, excel
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('report_daily_aggregates', function (Blueprint $table) {
            $table->id();
            $table->date('date')->index();
            $table->string('category')->nullable()->index();
            $table->decimal('total_sales', 15, 2)->default(0);
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->decimal('total_profit', 15, 2)->default(0);
            $table->integer('order_count')->default(0);
            $table->integer('item_count')->default(0);
            $table->timestamps();

            $table->unique(['date', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_daily_aggregates');
        Schema::dropIfExists('scheduled_reports');
        Schema::dropIfExists('saved_reports');
    }
};
