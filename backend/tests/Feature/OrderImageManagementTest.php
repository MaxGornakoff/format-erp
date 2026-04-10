<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderImageManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_order_with_multiple_images(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'role' => 'worker',
        ]);

        Sanctum::actingAs($user);

        $response = $this->post('/api/orders', [
            'description' => 'Order with attached images',
            'priority' => 'medium',
            'responsible_name' => 'Иван Петров',
            'images' => [
                UploadedFile::fake()->image('first.jpg', 1200, 800),
                UploadedFile::fake()->image('second.png', 800, 600),
            ],
        ], [
            'Accept' => 'application/json',
        ]);

        $response->assertCreated()
            ->assertJsonCount(2, 'images')
            ->assertJsonPath('images.0.original_name', 'first.jpg');

        $order = Order::query()->firstOrFail();

        $this->assertDatabaseCount('order_images', 2);
        $this->assertCount(2, $order->images);
        Storage::disk('public')->assertExists($order->images[0]->path);
        Storage::disk('public')->assertExists($order->images[1]->path);
    }

    public function test_user_can_remove_existing_image_and_upload_replacement_on_update(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'role' => 'manager',
        ]);

        Sanctum::actingAs($user);

        $order = Order::create([
            'title' => 'Image order',
            'description' => 'Initial description',
            'priority' => 'medium',
            'status' => 'new',
            'user_id' => $user->id,
            'responsible_name' => $user->name,
        ]);

        Storage::disk('public')->put("orders/{$order->id}/existing.jpg", 'fake-image-content');

        $existingImage = $order->images()->create([
            'disk' => 'public',
            'path' => "orders/{$order->id}/existing.jpg",
            'original_name' => 'existing.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1234,
            'sort_order' => 1,
        ]);

        $response = $this->post("/api/orders/{$order->id}", [
            '_method' => 'PATCH',
            'deleted_image_ids' => [$existingImage->id],
            'images' => [
                UploadedFile::fake()->image('replacement.webp', 1000, 700),
            ],
        ], [
            'Accept' => 'application/json',
        ]);

        $response->assertOk()
            ->assertJsonCount(1, 'images')
            ->assertJsonPath('images.0.original_name', 'replacement.webp');

        $order->refresh();

        $this->assertDatabaseMissing('order_images', ['id' => $existingImage->id]);
        $this->assertDatabaseCount('order_images', 1);
        Storage::disk('public')->assertMissing("orders/{$order->id}/existing.jpg");
        Storage::disk('public')->assertExists($order->images()->firstOrFail()->path);
    }

    public function test_user_can_set_another_image_as_cover(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'role' => 'manager',
        ]);

        Sanctum::actingAs($user);

        $order = Order::create([
            'title' => 'Cover order',
            'description' => 'Order with cover image selection',
            'priority' => 'medium',
            'status' => 'new',
            'user_id' => $user->id,
            'responsible_name' => $user->name,
        ]);

        Storage::disk('public')->put("orders/{$order->id}/cover-a.jpg", 'cover-a');
        Storage::disk('public')->put("orders/{$order->id}/cover-b.jpg", 'cover-b');

        $firstImage = $order->images()->create([
            'disk' => 'public',
            'path' => "orders/{$order->id}/cover-a.jpg",
            'original_name' => 'cover-a.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 100,
            'sort_order' => 1,
        ]);

        $secondImage = $order->images()->create([
            'disk' => 'public',
            'path' => "orders/{$order->id}/cover-b.jpg",
            'original_name' => 'cover-b.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 120,
            'sort_order' => 2,
        ]);

        $response = $this->patchJson("/api/orders/{$order->id}", [
            'cover_image_id' => $secondImage->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('images.0.id', $secondImage->id);

        $orderedIds = $order->fresh()->images()->pluck('id')->all();

        $this->assertSame([$secondImage->id, $firstImage->id], $orderedIds);
    }
}
