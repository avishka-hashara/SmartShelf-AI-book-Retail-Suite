<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('employee_id')->nullable()->unique()->after('store_id');
            $table->string('phone')->nullable()->after('employee_id');
            $table->string('nic')->nullable()->after('phone');
            $table->string('pin')->nullable()->after('nic'); // hashed 4-digit PIN
            $table->enum('status', ['active', 'inactive'])->default('active')->after('pin');
            $table->boolean('clocked_in')->default(false)->after('status');
            $table->timestamp('last_active_at')->nullable()->after('clocked_in');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'employee_id',
                'phone',
                'nic',
                'pin',
                'status',
                'clocked_in',
                'last_active_at',
            ]);
        });
    }
};
