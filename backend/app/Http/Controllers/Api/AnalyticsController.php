<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    /**
     * Get dashboard analytics (available to Manager and Admin).
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['manager', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Orders count by status
        $query = Order::query();
        
        // If manager, filter by team (simplified: all for now)
        // if ($user->role === 'manager') {
        //     $query->whereIn('user_id', $user->team()->pluck('id'));
        // }

        $ordersByStatus = [
            'new' => $query->clone()->where('status', 'new')->count(),
            'in_progress' => $query->clone()->where('status', 'in_progress')->count(),
            'completed' => $query->clone()->where('status', 'completed')->count(),
            'cancelled' => $query->clone()->where('status', 'cancelled')->count(),
        ];

        // Top active workers
        $topWorkers = User::withCount(['orders' => function ($q) {
            $q->where('status', 'completed');
        }])
        ->where('role', 'worker')
        ->orderByDesc('orders_count')
        ->limit(5)
        ->get(['id', 'name', 'orders_count']);

        return response()->json([
            'orders_by_status' => $ordersByStatus,
            'total_orders' => $query->count(),
            'top_workers' => $topWorkers,
        ]);
    }

    /**
     * Get orders trend data (available to Admin).
     */
    public function ordersTrend(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Orders created in last 30 days grouped by date
        $trend = Order::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'data' => $trend,
            'period' => 'last_30_days',
        ]);
    }

    /**
     * Get role statistics (available to Admin).
     */
    public function roleStats(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stats = [
            'workers' => User::where('role', 'worker')->count(),
            'managers' => User::where('role', 'manager')->count(),
            'admins' => User::where('role', 'admin')->count(),
        ];

        return response()->json($stats);
    }
}
