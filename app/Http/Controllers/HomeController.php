<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HomeController extends Controller
{
    /**
     * Display the homepage.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Welcome');
    }

    /**
     * Convert video using Python API
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function convert(Request $request)
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        try {
            // Make request to Python API
            $response = Http::timeout(300)
                ->connectTimeout(30) // 30 seconds connection timeout
                ->retry(2, 1000) // Retry 2 times with 1 second delay
                ->withHeaders([
                    'X-API-Key' => env('API_KEY'),
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ])
                ->post(env('PYTHON_API_URL', 'http://localhost:5001/api/convert'), [
                    'url' => $request->url
                ]);
            $response = Http::timeout(300)
                ->connectTimeout(30) // 30 seconds connection timeout
                ->retry(2, 1000) // Retry 2 times with 1 second delay
                ->withHeaders([
                    'X-API-Key' => env('API_KEY'),
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ])
                ->post(env('PYTHON_API_URL', 'http://localhost:5001/api/convert'), [
                    'url' => $request->url
                ]);

            if ($response->successful()) {
                $data = $response->json();

                if ($data['success']) {
                    return response()->json([
                        'success' => true,
                        'message' => $data['message'],
                        'data' => $data['data']
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => $data['message'] ?? 'Download failed'
                    ], 422);
                }
            } else {
                Log::error('Python API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => env('PYTHON_API_URL'),
                    'headers' => $response->headers()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to communicate with video converter service'
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Video conversion error', [
                'error' => $e->getMessage(),
                'url' => $request->url
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing your request. Please try again.'
            ], 500);
        }
    }
}
