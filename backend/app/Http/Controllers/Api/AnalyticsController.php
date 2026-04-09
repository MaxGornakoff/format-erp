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

        $query = Order::query();

        $ordersByStatus = [
            'new' => $query->clone()->where('status', 'new')->count(),
            'in_progress' => $query->clone()->where('status', 'in_progress')->count(),
            'completed' => $query->clone()->where('status', 'completed')->count(),
            'cancelled' => $query->clone()->where('status', 'cancelled')->count(),
        ];

        $responsibleExpression = "COALESCE(NULLIF(orders.responsible_name, ''), users.name, '—')";

        $topResponsibles = Order::query()
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->selectRaw("{$responsibleExpression} as name")
            ->selectRaw("MAX(COALESCE(users.email, '')) as email")
            ->selectRaw("SUM(CASE WHEN orders.status = 'completed' THEN 1 ELSE 0 END) as completed_count")
            ->groupByRaw($responsibleExpression)
            ->orderByDesc('completed_count')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_orders' => $query->count(),
                'new_orders' => $ordersByStatus['new'],
                'in_progress_orders' => $ordersByStatus['in_progress'],
                'completed_orders' => $ordersByStatus['completed'],
                'cancelled_orders' => $ordersByStatus['cancelled'],
            ],
            'orders_by_status' => $ordersByStatus,
            'top_workers' => $topResponsibles,
            'top_responsibles' => $topResponsibles,
        ]);
    }

    /**
     * Get orders trend data (available to Admin).
     */
    public function ordersTrend(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['manager', 'admin'])) {
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

        if (!in_array($user->role, ['manager', 'admin'])) {
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
