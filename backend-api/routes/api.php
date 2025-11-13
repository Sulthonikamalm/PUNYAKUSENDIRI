<?php

use App\Http\Controllers\Api\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes (no auth required)
Route::prefix('reports')->group(function () {
    // Get all reports (with filters)
    Route::get('/', [ReportController::class, 'index']);

    // Create new report (from chatbot)
    Route::post('/', [ReportController::class, 'store']);

    // Get single report
    Route::get('/{id}', [ReportController::class, 'show']);

    // Get statistics for dashboard
    Route::get('/stats/overview', [ReportController::class, 'stats']);

    // Update report (admin)
    Route::put('/{id}', [ReportController::class, 'update']);
    Route::patch('/{id}', [ReportController::class, 'update']);

    // Delete report (admin)
    Route::delete('/{id}', [ReportController::class, 'destroy']);
});

// User route (requires authentication)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
