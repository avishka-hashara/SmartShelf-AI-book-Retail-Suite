<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('role', 50);          // manager, cashier, lounge_manager, inventory
            $table->string('permission_key', 100);
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();

            $table->unique(['role', 'permission_key'], 'role_permission_unique');
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
