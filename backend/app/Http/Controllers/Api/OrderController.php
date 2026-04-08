<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\User;
use App\Support\ActivityLogger;
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
        $query = $this->buildFilteredQuery($request);

        $totals = [
            'order_cost' => (float) ((clone $query)->sum('order_cost') ?? 0),
            'package_cost' => (float) ((clone $query)->sum('package_cost') ?? 0),
        ];

        $allowedSorts = ['id', 'created_at', 'updated_at', 'status', 'priority', 'package_cost', 'order_cost', 'user_id'];
        $sort = in_array($request->sort, $allowedSorts, true) ? $request->sort : 'created_at';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $perPage = (int) ($request->per_page ?? 15);
        $orders = $query->paginate($perPage);

        $payload = $orders->toArray();
        $payload['totals'] = $totals;

        return response()->json($payload);
    }

    public function export(Request $request)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $query = $this->buildFilteredQuery($request);
        $allowedSorts = ['id', 'created_at', 'updated_at', 'status', 'priority', 'package_cost', 'order_cost', 'user_id'];
        $sort = in_array($request->sort, $allowedSorts, true) ? $request->sort : 'created_at';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';

        $totals = [
            'order_cost' => (float) ((clone $query)->sum('order_cost') ?? 0),
            'package_cost' => (float) ((clone $query)->sum('package_cost') ?? 0),
        ];

        $orders = $query->orderBy($sort, $direction)->get();
        $fileName = 'orders-export-' . now()->format('Y-m-d_H-i-s') . '.csv';

        return response()->streamDownload(function () use ($orders, $totals) {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                '№ Заказа',
                'Дата',
                'Исполнитель',
                'Описание',
                'Примечание',
                'Стоимость макета',
                'Стоимость заказа',
                'Срочность',
                'Статус',
            ], ';');

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->id,
                    optional($order->created_at)?->format('d.m.Y H:i'),
                    $order->user?->name ?? '—',
                    $order->description,
                    $order->note ?? '',
                    $order->package_cost,
                    $order->order_cost,
                    $this->formatPriorityLabel((string) $order->priority),
                    $this->formatStatusLabel((string) $order->status),
                ], ';');
            }

            fputcsv($handle, [], ';');
            fputcsv($handle, ['Итоги'], ';');
            fputcsv($handle, ['Сумма макетов', number_format((float) $totals['package_cost'], 2, '.', ' ')], ';');
            fputcsv($handle, ['Сумма заказов', number_format((float) $totals['order_cost'], 2, '.', ' ')], ';');

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
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

        ActivityLogger::log(
            $currentUser,
            'order.create',
            $request,
            'order',
            $order->id,
            'Created a new order',
            [
                'assigned_user_id' => $assignedUserId,
            ],
        );

        return response()->json($order->load('user:id,name,email,role'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Order $order)
    {
        $this->authorize('view', $order);

        ActivityLogger::log(
            $request->user(),
            'order.read',
            $request,
            'order',
            $order->id,
            'Viewed an order',
        );

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

        ActivityLogger::log(
            $currentUser,
            'order.update',
            $request,
            'order',
            $order->id,
            'Updated an order',
            [
                'changed_fields' => array_values(array_keys($data)),
            ],
        );

        return response()->json($order->load('user:id,name,email,role'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Order $order)
    {
        $this->authorize('delete', $order);

        ActivityLogger::log(
            $request->user(),
            'order.delete',
            $request,
            'order',
            $order->id,
            'Deleted an order',
        );

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }

    private function buildFilteredQuery(Request $request)
    {
        $query = Order::with(['user:id,name,email,role']);
        $user = $request->user();

        if ($user->role === 'worker') {
            $query->where('user_id', $user->id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->filled('user_id') && $user->role !== 'worker') {
            $query->where('user_id', (int) $request->user_id);
        }

        if ($request->search) {
            $search = (string) $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%')
                    ->orWhere('note', 'like', '%' . $search . '%')
                    ->orWhere('id', 'like', '%' . $search . '%');
            });
        }

        return $query;
    }

    private function formatPriorityLabel(string $priority): string
    {
        return match ($priority) {
            'low' => 'Низкая',
            'medium' => 'Средняя',
            'high' => 'Высокая',
            default => $priority,
        };
    }

    private function formatStatusLabel(string $status): string
    {
        return match ($status) {
            'new' => 'Новый',
            'in_progress' => 'В процессе',
            'completed' => 'Выполнен',
            'cancelled' => 'Отменён',
            default => $status,
        };
    }
}
