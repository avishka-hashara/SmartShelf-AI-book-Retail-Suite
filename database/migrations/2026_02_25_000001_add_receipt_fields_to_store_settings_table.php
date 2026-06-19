<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            // Receipt content
            $table->string('receipt_header')->nullable()->after('receipt_footer');
            $table->string('invoice_prefix')->default('INV-')->after('receipt_header');

            // Per-platform receipt visibility toggles
            $table->boolean('receipt_show_website')   ->default(false)->after('invoice_prefix');
            $table->boolean('receipt_show_facebook')  ->default(false)->after('receipt_show_website');
            $table->boolean('receipt_show_instagram') ->default(false)->after('receipt_show_facebook');
            $table->boolean('receipt_show_whatsapp')  ->default(false)->after('receipt_show_instagram');
        });
    }

    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn([
                'receipt_header',
                'invoice_prefix',
                'receipt_show_website',
                'receipt_show_facebook',
                'receipt_show_instagram',
                'receipt_show_whatsapp',
            ]);
        });
    }
};