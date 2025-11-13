<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AdminReportController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\AdminPostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AUTHENTICATION ROUTES (Public)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected auth routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    });
});

/*
|--------------------------------------------------------------------------
| USER REPORTS ROUTES (Authenticated Users)
|--------------------------------------------------------------------------
*/
Route::prefix('reports')->middleware('auth:sanctum')->group(function () {
    // User can create report with file upload
    Route::post('/', [ReportController::class, 'store']);

    // User can view their own reports
    Route::get('/', [ReportController::class, 'index']);
    Route::get('/{id}', [ReportController::class, 'show']);

    // Statistics (can be public or auth, depending on requirement)
    Route::get('/stats/overview', [ReportController::class, 'stats']);
});

/*
|--------------------------------------------------------------------------
| ADMIN REPORTS ROUTES (Admin Only)
|--------------------------------------------------------------------------
*/
Route::prefix('admin/reports')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Admin can view ALL reports
    Route::get('/', [AdminReportController::class, 'index']);
    Route::get('/{id}', [AdminReportController::class, 'show']);

    // Admin can update report status - CRITICAL ENDPOINT
    Route::patch('/{id}/status', [AdminReportController::class, 'updateStatus']);

    // Admin can fully update report
    Route::put('/{id}', [AdminReportController::class, 'update']);
    Route::patch('/{id}', [AdminReportController::class, 'update']);

    // Admin can delete report
    Route::delete('/{id}', [AdminReportController::class, 'destroy']);

    // Admin statistics
    Route::get('/statistics/overview', [AdminReportController::class, 'statistics']);
});

/*
|--------------------------------------------------------------------------
| PUBLIC POSTS ROUTES (No Auth Required)
|--------------------------------------------------------------------------
*/
Route::prefix('posts')->group(function () {
    // Get all PUBLISHED posts
    Route::get('/', [PostController::class, 'index']);

    // Get single published post by slug
    Route::get('/{slug}', [PostController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| ADMIN POSTS ROUTES (Admin Only)
|--------------------------------------------------------------------------
*/
Route::prefix('admin/posts')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Admin CRUD for posts
    Route::get('/', [AdminPostController::class, 'index']);
    Route::post('/', [AdminPostController::class, 'store']);
    Route::get('/{id}', [AdminPostController::class, 'show']);
    Route::put('/{id}', [AdminPostController::class, 'update']);
    Route::patch('/{id}', [AdminPostController::class, 'update']);
    Route::delete('/{id}', [AdminPostController::class, 'destroy']);

    // Toggle publish status
    Route::patch('/{id}/publish', [AdminPostController::class, 'togglePublish']);
});

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is running',
        'timestamp' => now()->toDateTimeString()
    ]);
});
