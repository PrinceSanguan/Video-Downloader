<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeEmail;
use Exception;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleGoogleCallback()
    {
        try {
            // Get user data from Google
            $googleUser = Socialite::driver('google')->user();

            Log::info('Google login attempt', ['email' => $googleUser->email]);

            // Find user by email or create new one
            $user = User::where('email', $googleUser->email)->first();
            $isNewUser = false;

            if (!$user) {
                // Check if the email is the admin email
                $userRole = $googleUser->email === 'princesanguan44@gmail.com' ? 'admin' : 'user';

                // Create a new user
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => Hash::make(rand(100000, 999999)), // Random password
                    'google_id' => $googleUser->id,
                    'user_role' => $userRole,
                ]);

                $isNewUser = true;
                Log::info('New user created', ['user_id' => $user->id, 'email' => $user->email]);
            } else {
                // Only update google_id and avatar, not the user_role
                $user->update([
                    'google_id' => $googleUser->id,
                ]);

                // If the email is the admin email and user_role is not admin, update it
                if ($googleUser->email === 'princesanguan44@gmail.com' && $user->user_role !== 'admin') {
                    $user->update(['user_role' => 'admin']);
                }

                Log::info('Existing user logged in', ['user_id' => $user->id, 'email' => $user->email]);
            }

            // Update last login time
            $user->update(['last_login_at' => now()]);

            // Log the user in
            Auth::login($user);

            // Send welcome email directly without queueing
            try {
                Log::info('Attempting to send welcome email', ['user_id' => $user->id, 'email' => $user->email]);

                // Use send() instead of queue() for immediate sending and troubleshooting
                Mail::to($user->email)->send(new WelcomeEmail($user));

                Log::info('Welcome email sent successfully', ['user_id' => $user->id, 'email' => $user->email]);

                // Store in session that email was sent
                session(['email_sent' => true]);
            } catch (Exception $emailException) {
                Log::error('Failed to send welcome email', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $emailException->getMessage(),
                    'trace' => $emailException->getTraceAsString()
                ]);

                // Store in session that email failed
                session(['email_failed' => true, 'email_error' => $emailException->getMessage()]);
            }

            // Redirect based on user role
            if ($user->user_role === 'admin') {
                return redirect()->route('admin.dashboard');
            } else {
                return redirect()->route('user.dashboard')->with('email_status', session('email_sent') ? 'sent' : 'failed');
            }
        } catch (Exception $e) {
            // Log the error with details
            Log::error('Google login error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            // Redirect back with error
            return redirect('/login')->with('error', 'Google login failed. Please try again.');
        }
    }
}
