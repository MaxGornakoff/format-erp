<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view orders (filtered by controller)
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Order $order): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        // Worker/Manager can view only their own orders or orders in their team
        // For basic implementation, allow if they're the author
        return $user->id === $order->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['worker', 'manager', 'admin']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Order $order): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        // Worker can edit only their own orders with status new or in_progress
        if ($user->role === 'worker' && $user->id === $order->user_id) {
            return in_array($order->status, ['new', 'in_progress']);
        }

        // Manager can edit orders in their team (simplified: allow all for now)
        if ($user->role === 'manager') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }
}

