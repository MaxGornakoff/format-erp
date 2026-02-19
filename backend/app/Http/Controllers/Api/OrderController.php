<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::with('user');
        $user = $request->user();

        // Filter based on role
        if ($user->role === 'worker') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'manager') {
            // Manager sees only their team's orders (simplified: all for now)
            // In production, implement team logic
        }
        // Admin sees all orders

        // Filter by status if provided
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Search by title or description
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Sorting
        $sort = $request->sort ?? 'created_at';
        $direction = $request->direction ?? 'desc';
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->per_page ?? 15;
        $orders = $query->paginate($perPage);

        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderRequest $request)
    {
        $this->authorize('create', Order::class);

        $order = Order::create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status ?? 'new',
            'user_id' => $request->user()->id,
        ]);

        return response()->json($order->load('user'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $this->authorize('view', $order);

        return response()->json($order->load('user'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        $order->update($request->validated());

        return response()->json($order->load('user'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }
}
