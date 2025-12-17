<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;

// KPI Stats (Debe ir antes de las rutas que usan {id})
Route::get('/orders/stats', [OrderController::class, 'stats']);

// List all orders
Route::get('/orders', [OrderController::class, 'index']);

// Create a new order
Route::post('/orders', [OrderController::class, 'store']);

// Show a single order by ID
Route::get('/orders/{order}', [OrderController::class, 'show']);

// Update an existing order (only editable if not in a final state)
Route::put('/orders/{order}', [OrderController::class, 'update']);

// Update the status of an order
Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
