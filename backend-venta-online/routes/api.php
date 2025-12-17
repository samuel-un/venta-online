<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;

Route::get('/orders/stats', [OrderController::class, 'stats']);
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{order}', [OrderController::class, 'show']);
Route::put('/orders/{order}', [OrderController::class, 'update']);
Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
