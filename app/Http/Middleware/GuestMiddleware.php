<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class GuestMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Get the authenticated user
                $user = Auth::guard($guard)->user();

                // Redirect based on user role
                // Check the user_role property or method based on your implementation
                if ($user->user_role === 'admin') {
                    return redirect()->route('admin.dashboard');
                } elseif ($user->user_role === 'user') {
                    return redirect()->route('user.dashboard');
                }

                // Default dashboard for any authenticated user
                return redirect()->route('user.dashboard');
            }
        }

        return $next($request);
    }
}
