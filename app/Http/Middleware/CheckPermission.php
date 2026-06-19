<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission  The permission key to check
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        // Not authenticated — let auth middleware handle redirect
        if (!$user) {
            abort(403, 'Unauthenticated.');
        }

        // Check permission (admin always passes via HasPermissions trait)
        if ($user->hasPermission($permission)) {
            return $next($request);
        }

        // Denied — Inertia request gets a rendered error page
        if ($request->header('X-Inertia')) {
            return Inertia::render('Errors/Unauthorized', [
                'status'  => 403,
                'message' => 'You do not have permission to access this page.',
                'role'    => $user->role,
            ])->toResponse($request)->setStatusCode(403);
        }

        // Denied — regular request
        abort(403, 'You do not have permission to access this page.');
    }
}
