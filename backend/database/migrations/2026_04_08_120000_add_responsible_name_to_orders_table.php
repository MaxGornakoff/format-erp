<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('responsible_name')->nullable()->after('user_id');
            $table->index('responsible_name');
        });

        if (DB::getDriverName() === 'sqlite') {
            $orders = DB::table('orders')
                ->whereNull('responsible_name')
                ->get(['id', 'user_id']);

            foreach ($orders as $order) {
                $userName = DB::table('users')
                    ->where('id', $order->user_id)
                    ->value('name');

                if ($userName !== null) {
                    DB::table('orders')
                        ->where('id', $order->id)
                        ->update([
                            'responsible_name' => $userName,
                        ]);
                }
            }
        } else {
            DB::table('orders')
                ->join('users', 'orders.user_id', '=', 'users.id')
                ->whereNull('orders.responsible_name')
                ->update([
                    'orders.responsible_name' => DB::raw('users.name'),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['responsible_name']);
            $table->dropColumn('responsible_name');
        });
    }
};
