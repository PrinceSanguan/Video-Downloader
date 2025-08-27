<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class UserMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthorized access',
                ], 401);
            }

            return redirect()->route('auth.login')->with('error', 'Please login to access this page');
        }

        // Check if authenticated user has user role or admin role
        if (Auth::user()->user_role !== 'user' && Auth::user()->user_role !== 'admin') {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Access denied. User privileges required',
                ], 403);
            }

            return redirect()->route('home')->with('error', 'Access denied. User privileges required');
        }

        // User is authenticated and has user role, proceed
        return $next($request);
    }
}
