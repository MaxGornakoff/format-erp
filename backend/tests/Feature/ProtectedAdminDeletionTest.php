<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProtectedAdminDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_primary_admin_account_cannot_be_deleted(): void
    {
        $actingAdmin = User::factory()->create([
            'role' => 'admin',
            'email' => 'second-admin@example.com',
        ]);

        $primaryAdmin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@example.com',
        ]);

        Sanctum::actingAs($actingAdmin);

        $response = $this->deleteJson("/api/users/{$primaryAdmin->id}");

        $response
            ->assertStatus(403)
            ->assertJson([
                'message' => 'The primary administrator account cannot be deleted.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $primaryAdmin->id,
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);
    }

    public function test_primary_admin_protected_fields_cannot_be_changed(): void
    {
        $actingAdmin = User::factory()->create([
            'role' => 'admin',
            'email' => 'second-admin@example.com',
        ]);

        $primaryAdmin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@example.com',
            'is_tracked' => true,
        ]);

        Sanctum::actingAs($actingAdmin);

        $response = $this->patchJson("/api/users/{$primaryAdmin->id}", [
            'email' => 'changed-admin@example.com',
            'role' => 'manager',
            'is_tracked' => false,
        ]);

        $response
            ->assertStatus(403)
            ->assertJson([
                'message' => 'Protected fields of the primary administrator account cannot be changed.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $primaryAdmin->id,
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_tracked' => true,
        ]);
    }
}
