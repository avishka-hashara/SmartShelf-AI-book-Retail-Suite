<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserManagementController extends Controller
{
    /**
     * Allowed non-admin roles for user management.
     */
    private const ALLOWED_ROLES = ['manager', 'cashier', 'lounge_manager', 'inventory'];

    /**
     * Get all users for Settings → Users & Access Control section.
     */
    public static function getUsersForSettings(): array
    {
        return User::select('id', 'name', 'email', 'avatar', 'role', 'status', 'employee_id', 'created_at')
            ->orderByRaw("FIELD(role, 'admin') DESC")
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    /**
     * Store a new system user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'role'     => 'required|string|in:' . implode(',', self::ALLOWED_ROLES),
            'password' => ['required', 'confirmed', Rules\Password::min(8)],
        ]);

        // Auto-generate employee ID following existing pattern from EmployeeController
        $lastId = User::whereNotNull('employee_id')->orderByDesc('id')->value('employee_id');
        $nextNum = $lastId ? (int) ltrim(str_replace('EMP-', '', $lastId), '0') + 1 : 1;

        User::create([
            'name'        => $validated['name'],
            'email'       => $validated['email'],
            'role'        => $validated['role'],
            'password'    => Hash::make($validated['password']),
            'employee_id' => 'EMP-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT),
            'status'      => 'active',
        ]);

        return back()->with('success', 'User created successfully.');
    }

    /**
     * Update an existing user's details.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Prevent changing an admin's role
        if ($user->role === 'admin' && $request->input('role') !== 'admin') {
            return back()->with('error', 'Cannot change the role of an admin user.');
        }

        // Prevent promoting anyone TO admin via this interface
        if ($user->role !== 'admin' && $request->input('role') === 'admin') {
            return back()->with('error', 'Cannot assign admin role through user management.');
        }

        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'email'  => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role'   => 'required|string|in:' . implode(',', self::ALLOWED_ROLES),
            'status' => 'sometimes|string|in:active,inactive',
        ]);

        $user->update($validated);

        // Only update password if provided
        if ($request->filled('password')) {
            $request->validate([
                'password' => ['confirmed', Rules\Password::min(8)],
            ]);
            $user->update(['password' => Hash::make($request->input('password'))]);
        }

        return back()->with('success', 'User updated successfully.');
    }

    /**
     * Delete a user from the system.
     */
    public function destroy($id): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account. Ask another administrator to manage your account if needed.');
        }

        // Prevent deleting admin users
        if ($user->role === 'admin') {
            return back()->with('error', 'Admin accounts are protected and cannot be deleted. Demote the user first if you need to remove them.');
        }

        // Check for related orders before hard-deleting
        $hasOrders = \App\Models\Order::where('cashier_id', $user->id)
            ->orWhere('user_id', $user->id)
            ->exists();

        if ($hasOrders) {
            // Soft-delete by deactivating — following EmployeeController pattern
            $user->update(['status' => 'inactive']);
            return back()->with('success', 'User has existing sales records and was deactivated instead of deleted.');
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }

    /**
     * Toggle user active/inactive status.
     */
    public function toggleStatus($id): RedirectResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot change your own account status. Ask another administrator for help.');
        }

        if ($user->role === 'admin') {
            return back()->with('error', 'Admin account status cannot be changed here. Demote the user first if needed.');
        }

        $newStatus = $user->status === 'active' ? 'inactive' : 'active';
        $user->update(['status' => $newStatus]);

        $label = $newStatus === 'active' ? 'activated' : 'deactivated';

        return back()->with('success', "User {$label} successfully.");
    }
}
