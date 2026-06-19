<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    /**
     * Display the staff management page with paginated employees.
     */
    public function index(Request $request)
    {
        $query = User::with([
            'shifts' => function ($q) {
                $q->latest()->limit(10);
            },
            'performance'
        ])
            ->when($request->search, function ($q, $s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('employee_id', 'like', "%{$s}%")
                    ->orWhere('role', 'like', "%{$s}%");
            })
            ->when($request->role && $request->role !== 'all', function ($q) use ($request) {
                $q->where('role', $request->role);
            })
            ->orderBy('name');

        $employees = $query->paginate(10)->withQueryString();

        return Inertia::render('Employees/Employees', [
            'employees' => $employees,
            'filters' => $request->only(['search', 'role']),
            'stats' => [
                'total' => User::where('status', 'active')->count(),
                'online' => User::where('status', 'active')
                    ->where(function($q) {
                        $q->where('clocked_in', true)
                          ->orWhere('last_active_at', '>=', Carbon::now()->subMinutes(3));
                    })
                    ->count(),
                'admins' => User::where('role', 'admin')->count(),
                'cashiers' => User::where('role', 'cashier')->count(),
            ],
        ]);
    }

    /**
     * Store a new employee.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => ['nullable', 'string', 'regex:/^\d{10}$/'],
            'nic' => ['nullable', 'string', 'regex:/^([0-9]{9}[vVxX]|[0-9]{12})$/'],
            'role' => 'required|string|in:admin,cashier,lounge_manager,inventory',
            'status' => 'required|in:active,inactive',
            'password' => 'required|string|min:8',
        ], [
            'phone.regex' => 'The phone number must be exactly 10 digits.',
            'nic.regex' => 'The NIC must be exactly 9 digits followed by a letter, or exactly 12 digits.',
        ]);

        // Auto-generate a sequential employee ID
        $lastId = User::whereNotNull('employee_id')->orderByDesc('id')->value('employee_id');
        $nextNum = $lastId ? (int) ltrim(str_replace('EMP-', '', $lastId), '0') + 1 : 1;
        $validated['employee_id'] = 'EMP-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('staff.index')->with('success', 'Employee added successfully.');
    }

    /**
     * Update an existing employee profile.
     */
    public function update(Request $request, $id)
    {
        $employee = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'phone' => ['nullable', 'string', 'regex:/^\d{10}$/'],
            'nic' => ['nullable', 'string', 'regex:/^([0-9]{9}[vVxX]|[0-9]{12})$/'],
            'role' => 'required|string|in:admin,cashier,lounge_manager,inventory',
            'status' => 'required|in:active,inactive',
        ], [
            'phone.regex' => 'The phone number must be exactly 10 digits.',
            'nic.regex' => 'The NIC must be exactly 9 digits followed by a letter, or exactly 12 digits.',
        ]);

        $employee->update($validated);

        return redirect()->route('staff.index')->with('success', 'Employee updated successfully.');
    }

    /**
     * Deactivate (soft-delete) an employee.
     */
    public function destroy($id)
    {
        $employee = User::findOrFail($id);

        // Prevent self-deactivation
        if ($employee->id === auth()->id()) {
            return redirect()->route('staff.index')
                ->with('error', 'You cannot deactivate your own account.');
        }

        // Prevent deactivating other admin accounts
        if ($employee->role === 'admin') {
            return redirect()->route('staff.index')
                ->with('error', 'Admin accounts cannot be deactivated from the staff management panel. Use Settings instead.');
        }

        $employee->update(['status' => 'inactive']);

        return redirect()->route('staff.index')->with('success', 'Employee deactivated.');
    }

    /**
     * Reset the employee's 4-digit POS PIN.
     */
    public function resetPin(Request $request, $id)
    {
        $request->validate([
            'pin' => 'required|digits:4',
        ]);

        $employee = User::findOrFail($id);
        $employee->update(['pin' => Hash::make($request->pin)]);

        return back()->with('success', 'PIN reset successfully.');
    }

    /**
     * Reset the employee's login password.
     */
    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'admin_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'admin_password.current_password' => 'The provided password does not match your current password. Authorization failed.',
        ]);

        $employee = User::findOrFail($id);
        $employee->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Password reset successfully.');
    }

    /**
     * Upload and update the employee's profile photo.
     */
    public function uploadAvatar(Request $request, $id)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $employee = User::findOrFail($id);

        if ($request->hasFile('avatar')) {
            // Delete old avatar if it exists
            if ($employee->avatar) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($employee->avatar);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $employee->update(['avatar' => $path]);
        }

        return back()->with('success', 'Profile photo updated successfully.');
    }
}
