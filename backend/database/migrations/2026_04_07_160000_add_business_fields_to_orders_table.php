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
        Schema::table('orders', function (Blueprint $table) {
            $table->text('note')->nullable()->after('description');
            $table->decimal('package_cost', 10, 2)->nullable()->after('note');
            $table->decimal('order_cost', 10, 2)->nullable()->after('package_cost');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium')->after('order_cost');

            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['priority']);
            $table->dropColumn(['note', 'package_cost', 'order_cost', 'priority']);
        });
    }
};
