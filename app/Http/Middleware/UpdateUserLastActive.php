<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class UpdateUserLastActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Update last_active_at if it's null or more than 1 minute since last update
            // We use a small interval to avoid excessive database writes on every request
            if (!$user->last_active_at || $user->last_active_at->diffInMinutes(Carbon::now()) >= 1) {
                // Using update instead of save to skip firing events if not needed, 
                // but save() is fine here since it's just one field.
                $user->last_active_at = Carbon::now();
                $user->save(['timestamps' => false]);
            }
        }

        return $next($request);
    }
}
