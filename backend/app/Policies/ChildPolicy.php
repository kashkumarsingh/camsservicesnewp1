<?php

namespace App\Policies;

use App\Models\Child;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ChildPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     * Admin and super_admin can always view the Children resource (User Management).
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        $role = strtolower((string) ($user->role ?? ''));
        if (in_array($role, ['admin', 'super_admin'], true)) {
            return true;
        }

        return $user->hasPermissionTo('children.view');
    }

    /**
     * Determine whether the user can view the model.
     * Admin and super_admin can view any child; otherwise permission or parent ownership.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Child  $child
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Child $child)
    {
        $role = strtolower((string) ($user->role ?? ''));
        if (in_array($role, ['admin', 'super_admin'], true)) {
            return true;
        }

        return $user->hasPermissionTo('children.view') || $user->id === $child->user_id;
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasPermissionTo('children.create');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Child  $child
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, Child $child)
    {
        return $user->hasPermissionTo('children.update') || $user->id === $child->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Child  $child
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Child $child)
    {
        if ($user->hasPermissionTo('children.delete')) {
            return true;
        }

        if ($user->id === $child->user_id) {
            // A user can delete their own child record if it has no dependencies.
            return !$child->hasDependencies();
        }

        return false;
    }

    /**
     * Determine whether the user can archive the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Child  $child
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function archive(User $user, Child $child)
    {
        if ($user->hasPermissionTo('children.archive')) {
            return true;
        }

        if ($user->id === $child->user_id) {
            return $child->isArchivalEligible();
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Child  $child
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function restore(User $user, Child $child)
    {
        return $user->hasPermissionTo('children.restore');
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Child  $child
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function forceDelete(User $user, Child $child)
    {
        return $user->hasPermissionTo('children.force-delete');
    }
}
