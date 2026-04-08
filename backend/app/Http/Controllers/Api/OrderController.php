<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::with(['user:id,name,email,role']);
        $user = $request->user();

        if ($user->role === 'worker') {
            $query->where('user_id', $user->id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%')
                    ->orWhere('note', 'like', '%' . $search . '%')
                    ->orWhere('id', 'like', '%' . $search . '%');
            });
        }

        $allowedSorts = ['id', 'created_at', 'updated_at', 'status', 'priority', 'package_cost', 'order_cost', 'user_id'];
        $sort = in_array($request->sort, $allowedSorts, true) ? $request->sort : 'created_at';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $perPage = (int) ($request->per_page ?? 15);
        $orders = $query->paginate($perPage);

        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderRequest $request)
    {
        $this->authorize('create', Order::class);

        $data = $request->validated();
        $currentUser = $request->user();
        $assignedUserId = $currentUser->id;

        if (in_array($currentUser->role, ['manager', 'admin'], true)) {
            if (empty($data['user_id'])) {
                throw ValidationException::withMessages([
                    'user_id' => 'Please select a worker executor.',
                ]);
            }

            $worker = User::where('role', 'worker')->find($data['user_id']);

            if (! $worker) {
                throw ValidationException::withMessages([
                    'user_id' => 'Selected executor must be a worker.',
                ]);
            }

            $assignedUserId = $worker->id;
        }

        $generatedTitle = trim((string) ($data['title'] ?? ''));

        if ($generatedTitle === '') {
            $generatedTitle = Str::limit(trim($data['description']), 80, '');
        }

        if ($generatedTitle === '') {
            $generatedTitle = 'Order ' . now()->format('YmdHis');
        }

        $order = Order::create([
            'title' => $generatedTitle,
            'description' => $data['description'],
            'note' => $data['note'] ?? null,
            'package_cost' => $data['package_cost'] ?? null,
            'order_cost' => $data['order_cost'] ?? null,
            'priority' => $data['priority'] ?? 'medium',
            'status' => 'new',
            'user_id' => $assignedUserId,
        ]);

        return response()->json($order->load('user:id,name,email,role'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $this->authorize('view', $order);

        return response()->json($order->load('user:id,name,email,role'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        $data = $request->validated();
        $currentUser = $request->user();

        if (array_key_exists('user_id', $data)) {
            if (! in_array($currentUser->role, ['manager', 'admin'], true)) {
                unset($data['user_id']);
            } else {
                $worker = User::where('role', 'worker')->find($data['user_id']);

                if (! $worker) {
                    throw ValidationException::withMessages([
                        'user_id' => 'Selected executor must be a worker.',
                    ]);
                }
            }
        }

        if (array_key_exists('description', $data) && empty($data['title'])) {
            $data['title'] = Str::limit(trim((string) $data['description']), 80, '');
        }

        $order->update($data);

        return response()->json($order->load('user:id,name,email,role'));
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
