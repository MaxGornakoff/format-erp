<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\User;
use App\Support\ActivityLogger;
use App\Support\OrderImageOptimizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(private readonly OrderImageOptimizer $orderImageOptimizer)
    {
    }

    private const MAX_ORDER_IMAGES = 10;

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

        $allowedSorts = ['id', 'created_at', 'updated_at', 'status', 'priority', 'package_cost', 'order_cost', 'responsible_name'];
        $sort = in_array($request->sort, $allowedSorts, true) ? $request->sort : 'created_at';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $perPage = (int) ($request->per_page ?? 15);
        $orders = $query->paginate($perPage);

        $payload = $orders->toArray();
        $payload['totals'] = $totals;
        $payload['responsibles'] = $this->getResponsibleSuggestions($request);

        return response()->json($payload);
    }

    public function export(Request $request)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $query = $this->buildFilteredQuery($request);
        $allowedSorts = ['id', 'created_at', 'updated_at', 'status', 'priority', 'package_cost', 'order_cost', 'responsible_name'];
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
                'Ответственный',
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
                    $this->resolveResponsibleName($order),
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
        $responsibleName = trim((string) ($data['responsible_name'] ?? ''));

        if (! in_array($currentUser->role, ['manager', 'admin'], true)) {
            unset($data['package_cost'], $data['order_cost']);
        }

        if ($responsibleName === '') {
            $responsibleName = trim((string) $currentUser->name);
        }

        if ($responsibleName === '') {
            throw ValidationException::withMessages([
                'responsible_name' => 'Please enter a responsible user.',
            ]);
        }

        $generatedTitle = trim((string) ($data['title'] ?? ''));

        if ($generatedTitle === '') {
            $generatedTitle = Str::limit(trim((string) $data['description']), 80, '');
        }

        if ($generatedTitle === '') {
            $generatedTitle = 'Order ' . now()->format('YmdHis');
        }

        $coverUploadIndex = array_key_exists('cover_upload_index', $data)
            ? (int) $data['cover_upload_index']
            : null;

        unset($data['images'], $data['deleted_image_ids'], $data['cover_image_id'], $data['cover_upload_index']);

        $order = DB::transaction(function () use ($data, $currentUser, $generatedTitle, $request, $responsibleName, $coverUploadIndex) {
            $order = Order::create([
                'title' => $generatedTitle,
                'description' => $data['description'],
                'note' => $data['note'] ?? null,
                'package_cost' => $data['package_cost'] ?? null,
                'order_cost' => $data['order_cost'] ?? null,
                'priority' => $data['priority'] ?? 'medium',
                'status' => 'new',
                'user_id' => $currentUser->id,
                'responsible_name' => $responsibleName,
            ]);

            $createdImageIds = $this->storeUploadedImages($request, $order);

            if ($coverUploadIndex !== null && isset($createdImageIds[$coverUploadIndex])) {
                $this->setCoverImage($order, (int) $createdImageIds[$coverUploadIndex]);
            }

            return $order;
        });

        ActivityLogger::log(
            $currentUser,
            'order.create',
            $request,
            'order',
            $order->id,
            'Created a new order',
            [
                'responsible_name' => $responsibleName,
                'images_count' => $order->images()->count(),
            ],
        );

        return response()->json($order->fresh()->load($this->orderRelations()), 201);
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

        return response()->json($order->load($this->orderRelations()));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        $data = $request->validated();
        $currentUser = $request->user();
        $deletedImageIds = collect($data['deleted_image_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->values()
            ->all();
        $coverImageId = array_key_exists('cover_image_id', $data) && $data['cover_image_id'] !== null
            ? (int) $data['cover_image_id']
            : null;
        $coverUploadIndex = array_key_exists('cover_upload_index', $data) && $data['cover_upload_index'] !== null
            ? (int) $data['cover_upload_index']
            : null;

        unset($data['user_id'], $data['images'], $data['deleted_image_ids'], $data['cover_image_id'], $data['cover_upload_index']);

        if (! in_array($currentUser->role, ['manager', 'admin'], true)) {
            unset($data['package_cost'], $data['order_cost']);
        }

        if (array_key_exists('responsible_name', $data)) {
            $data['responsible_name'] = trim((string) $data['responsible_name']);

            if ($data['responsible_name'] === '') {
                throw ValidationException::withMessages([
                    'responsible_name' => 'Please enter a responsible user.',
                ]);
            }
        }

        if (array_key_exists('description', $data) && empty($data['title'])) {
            $data['title'] = Str::limit(trim((string) $data['description']), 80, '');
        }

        $this->ensureImageLimit($request, $order, $deletedImageIds);

        DB::transaction(function () use ($data, $deletedImageIds, $order, $request, $coverImageId, $coverUploadIndex) {
            if (! empty($data)) {
                $order->update($data);
            }

            $this->deleteSelectedImages($order, $deletedImageIds);
            $createdImageIds = $this->storeUploadedImages($request, $order);

            if ($coverUploadIndex !== null && isset($createdImageIds[$coverUploadIndex])) {
                $this->setCoverImage($order, (int) $createdImageIds[$coverUploadIndex]);
            } elseif ($coverImageId !== null) {
                $this->setCoverImage($order, $coverImageId);
            }
        });

        $changedFields = array_values(array_keys($data));

        if (! empty($deletedImageIds)) {
            $changedFields[] = 'deleted_image_ids';
        }

        if ($request->hasFile('images')) {
            $changedFields[] = 'images';
        }

        if ($coverImageId !== null || $coverUploadIndex !== null) {
            $changedFields[] = 'cover_image';
        }

        ActivityLogger::log(
            $currentUser,
            'order.update',
            $request,
            'order',
            $order->id,
            'Updated an order',
            [
                'changed_fields' => array_values(array_unique($changedFields)),
            ],
        );

        return response()->json($order->fresh()->load($this->orderRelations()));
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
        $query = Order::with($this->orderRelations());
        $user = $request->user();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->boolean('mine') && $user?->role === 'manager') {
            $normalizedResponsible = mb_strtolower(trim((string) $user->name));

            $query->where(function ($q) use ($normalizedResponsible) {
                $q->whereRaw('LOWER(responsible_name) = ?', [$normalizedResponsible])
                    ->orWhere(function ($fallbackQuery) use ($normalizedResponsible) {
                        $fallbackQuery
                            ->where(function ($emptyNameQuery) {
                                $emptyNameQuery->whereNull('responsible_name')
                                    ->orWhere('responsible_name', '');
                            })
                            ->whereHas('user', function ($userQuery) use ($normalizedResponsible) {
                                $userQuery->whereRaw('LOWER(name) = ?', [$normalizedResponsible]);
                            });
                    });
            });
        } elseif ($request->filled('responsible')) {
            $responsible = trim((string) $request->responsible);
            $normalizedResponsible = mb_strtolower($responsible);

            $query->where(function ($q) use ($normalizedResponsible) {
                $q->whereRaw('LOWER(responsible_name) = ?', [$normalizedResponsible])
                    ->orWhere(function ($fallbackQuery) use ($normalizedResponsible) {
                        $fallbackQuery
                            ->where(function ($emptyNameQuery) {
                                $emptyNameQuery->whereNull('responsible_name')
                                    ->orWhere('responsible_name', '');
                            })
                            ->whereHas('user', function ($userQuery) use ($normalizedResponsible) {
                                $userQuery->whereRaw('LOWER(name) = ?', [$normalizedResponsible]);
                            });
                    });
            });
        }

        if ($request->search) {
            $search = (string) $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%')
                    ->orWhere('note', 'like', '%' . $search . '%')
                    ->orWhere('responsible_name', 'like', '%' . $search . '%')
                    ->orWhere('id', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', '%' . $search . '%');
                    });
            });
        }

        return $query;
    }

    private function orderRelations(): array
    {
        return [
            'user:id,name,email,role,real_name',
            'responsibleUser:id,name,email,role,real_name',
            'images',
        ];
    }

    private function ensureImageLimit(Request $request, Order $order, array $deletedImageIds = []): void
    {
        $uploadedImages = $request->file('images', []);
        $uploadedCount = is_array($uploadedImages) ? count($uploadedImages) : 0;
        $existingCount = $order->images()->count();
        $deletedCount = empty($deletedImageIds)
            ? 0
            : $order->images()->whereIn('id', $deletedImageIds)->count();

        if (($existingCount - $deletedCount + $uploadedCount) > self::MAX_ORDER_IMAGES) {
            throw ValidationException::withMessages([
                'images' => 'You can attach up to 10 images to one order.',
            ]);
        }
    }

    private function deleteSelectedImages(Order $order, array $deletedImageIds = []): void
    {
        if (empty($deletedImageIds)) {
            return;
        }

        $order->images()
            ->whereIn('id', $deletedImageIds)
            ->get()
            ->each
            ->delete();
    }

    private function storeUploadedImages(Request $request, Order $order): array
    {
        $uploadedImages = $request->file('images', []);

        if (! is_array($uploadedImages) || empty($uploadedImages)) {
            return [];
        }

        $sortOrder = (int) $order->images()->max('sort_order');
        $createdImageIds = [];

        foreach ($uploadedImages as $uploadedImage) {
            if (! $uploadedImage) {
                continue;
            }

            $sortOrder++;
            $path = $uploadedImage->store("orders/{$order->id}", 'public');
            $thumbnailPath = $this->orderImageOptimizer->createThumbnail($uploadedImage, $order->id, 'public');

            $image = $order->images()->create([
                'disk' => 'public',
                'path' => $path,
                'thumbnail_path' => $thumbnailPath,
                'original_name' => $uploadedImage->getClientOriginalName(),
                'mime_type' => $uploadedImage->getClientMimeType(),
                'size' => $uploadedImage->getSize() ?: 0,
                'sort_order' => $sortOrder,
            ]);

            $createdImageIds[] = $image->id;
        }

        return $createdImageIds;
    }

    private function setCoverImage(Order $order, int $coverImageId): void
    {
        $imageIds = $order->images()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        if (! in_array($coverImageId, $imageIds, true)) {
            throw ValidationException::withMessages([
                'cover_image_id' => 'The selected cover image does not belong to this order.',
            ]);
        }

        $orderedIds = array_values(array_unique(array_merge([$coverImageId], array_diff($imageIds, [$coverImageId]))));

        foreach ($orderedIds as $index => $imageId) {
            $order->images()->whereKey($imageId)->update([
                'sort_order' => $index + 1,
            ]);
        }
    }

    private function getResponsibleSuggestions(Request $request): array
    {
        $names = Order::query()
            ->whereNotNull('responsible_name')
            ->where('responsible_name', '!=', '')
            ->distinct()
            ->orderBy('responsible_name')
            ->pluck('responsible_name')
            ->filter(fn ($name) => is_string($name) && trim($name) !== '')
            ->values();

        if ($names->isEmpty()) {
            return [];
        }

        $usersByName = User::query()
            ->whereIn('name', $names->all())
            ->get(['name', 'real_name'])
            ->keyBy(fn (User $user) => mb_strtolower(trim((string) $user->name)));

        return $names
            ->map(function (string $name) use ($usersByName) {
                $normalizedName = mb_strtolower(trim($name));
                /** @var User|null $matchedUser */
                $matchedUser = $usersByName->get($normalizedName);
                $realName = trim((string) ($matchedUser?->real_name ?? ''));

                return [
                    'value' => $name,
                    'label' => $realName !== '' ? sprintf('%s — %s', $name, $realName) : $name,
                    'real_name' => $realName !== '' ? $realName : null,
                ];
            })
            ->all();
    }

    private function resolveResponsibleName(Order $order): string
    {
        $responsibleName = trim((string) ($order->responsible_name ?? ''));

        if ($responsibleName !== '') {
            return $responsibleName;
        }

        return $order->user?->name ?? '—';
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
