<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();
        $currentUser = $request->user();

        if ($currentUser->role === 'manager') {
            $query->where('role', 'worker');
        } elseif ($request->role) {
            $query->where('role', $request->role);
        }

        // Search by name or email
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Sorting
        $sort = $request->sort ?? 'created_at';
        $direction = $request->direction ?? 'desc';
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->per_page ?? 15;
        $users = $query->paginate($perPage);

        ActivityLogger::log(
            $currentUser,
            'user.read.list',
            $request,
            'user',
            null,
            'Viewed user list',
            [
                'page' => (int) $users->currentPage(),
                'per_page' => (int) $users->perPage(),
            ],
        );

        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);

        $currentUser = $request->user();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'worker',
            'is_tracked' => $request->boolean('is_tracked'),
        ]);

        ActivityLogger::log(
            $currentUser,
            'user.create',
            $request,
            'user',
            $user->id,
            'Created a new user account',
            [
                'target_user_id' => $user->id,
                'target_role' => $user->role,
            ],
        );

        if ($user->is_tracked) {
            ActivityLogger::log(
                $user,
                'tracking.enabled',
                $request,
                'user',
                $user->id,
                'Activity tracking enabled by administrator',
                [
                    'changed_by' => $currentUser?->id,
                ],
                true,
            );
        }

        return response()->json($user, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, User $user)
    {
        $this->authorize('view', $user);

        ActivityLogger::log(
            $request->user(),
            'user.read',
            $request,
            'user',
            $user->id,
            'Viewed a user profile',
            [
                'target_user_id' => $user->id,
            ],
        );

        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        $data = $request->validated();
        $currentUser = $request->user();
        $wasTracked = (bool) $user->is_tracked;

        // Don't update password here (separate endpoint)
        if (isset($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        ActivityLogger::log(
            $currentUser,
            'user.update',
            $request,
            'user',
            $user->id,
            'Updated a user account',
            [
                'target_user_id' => $user->id,
                'changed_fields' => array_values(array_diff(array_keys($data), ['password'])),
            ],
        );

        if (array_key_exists('is_tracked', $data) && $wasTracked !== (bool) $user->is_tracked) {
            ActivityLogger::log(
                $user,
                $user->is_tracked ? 'tracking.enabled' : 'tracking.disabled',
                $request,
                'user',
                $user->id,
                $user->is_tracked
                    ? 'Activity tracking enabled by administrator'
                    : 'Activity tracking disabled by administrator',
                [
                    'changed_by' => $currentUser?->id,
                ],
                true,
            );
        }

        return response()->json($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user)
    {
        $this->authorize('delete', $user);

        $targetUserId = $user->id;

        ActivityLogger::log(
            $request->user(),
            'user.delete',
            $request,
            'user',
            $targetUserId,
            'Deleted a user account',
            [
                'target_user_id' => $targetUserId,
            ],
        );

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
