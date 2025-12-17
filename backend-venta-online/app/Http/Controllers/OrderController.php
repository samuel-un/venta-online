<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderController extends Controller
{
	public function index(Request $request)
	{
		$query = Order::with('items', 'statusLogs')->orderBy('created_at', 'desc');

		if ($request->has('search') && !empty($request->search)) {
			$search = $request->search;
			$query->where(function ($q) use ($search) {
				$q->where('order_number', 'LIKE', "%{$search}%")
					->orWhere('customer_email', 'LIKE', "%{$search}%");
			});
		}

		$orders = $query->paginate(10);

		$orders->getCollection()->transform(function ($order) {
			$order->allowed_transitions = $order->getAllowedTransitions();
			$order->customer_email = $order->customer_email ?? '';
			$order->customer_phone = $order->customer_phone ?? '';
			return $order;
		});

		return response()->json($orders, 200);
	}

	public function stats()
	{
		$stats = [
			'total_orders' => Order::count(),
			// Consideramos "Pendiente" como CREATED para el flujo inicial
			'pending_orders' => Order::where('status', 'CREATED')->count(),
			'revenue' => Order::whereIn('status', ['CONFIRMED', 'SHIPPED', 'DELIVERED'])->sum('total_amount'),
			'orders_today' => Order::whereDate('created_at', Carbon::today())->count(),
		];

		return response()->json($stats, 200);
	}

	public function store(Request $request)
	{
		$data = $request->validate([
			'customer_name' => 'required|string|max:255',
			'customer_email' => 'required|email|max:255',
			'customer_phone' => 'nullable|string|max:50',
			'total_amount' => 'required|numeric|min:0',
			'items' => 'required|array|min:1',
			'items.*.product_name' => 'required|string|max:255',
			'items.*.quantity' => 'required|integer|min:1',
			'items.*.unit_price' => 'required|numeric|min:0',
		]);

		return DB::transaction(function () use ($data) {
			do {
				$orderNumber = 'ES' . mt_rand(100000, 999999);
			} while (Order::where('order_number', $orderNumber)->exists());

			$order = Order::create([
				'order_number' => $orderNumber,
				'customer_name' => $data['customer_name'],
				'customer_email' => $data['customer_email'],
				'customer_phone' => $data['customer_phone'] ?? null,
				'total_amount' => $data['total_amount'],
			]);

			$order->items()->createMany($data['items']);

			$order->customer_email = $order->customer_email ?? '';
			$order->customer_phone = $order->customer_phone ?? '';

			return response()->json($order->load('items', 'statusLogs'), 201);
		});
	}

	public function show(Order $order)
	{
		$order->load('items', 'statusLogs');
		$order->customer_email = $order->customer_email ?? '';
		$order->customer_phone = $order->customer_phone ?? '';
		$order->allowed_transitions = $order->getAllowedTransitions();

		return response()->json($order, 200);
	}

	public function update(Request $request, Order $order)
	{
		if ($order->isFinal()) {
			return response()->json([
				'message' => 'No se puede actualizar un pedido finalizado.',
				'current_status' => $order->status
			], 400);
		}

		$data = $request->validate([
			'customer_name' => 'sometimes|string|max:255',
			'customer_email' => 'sometimes|nullable|email|max:255',
			'customer_phone' => 'sometimes|nullable|string|max:50',
			'total_amount' => 'sometimes|numeric|min:0',
			'items' => 'sometimes|array|min:1',
			'items.*.id' => 'sometimes|integer|exists:order_items,id',
			'items.*.product_name' => 'required_with:items|string|max:255',
			'items.*.quantity' => 'required_with:items|integer|min:1',
			'items.*.unit_price' => 'required_with:items|numeric|min:0',
		]);

		return DB::transaction(function () use ($order, $data) {
			$order->update($data);

			if (!empty($data['items'])) {
				$sentItemIds = collect($data['items'])->pluck('id')->filter()->toArray();
				$order->items()->whereNotIn('id', $sentItemIds)->delete();

				foreach ($data['items'] as $itemData) {
					if (isset($itemData['id'])) {
						$item = OrderItem::find($itemData['id']);
						if ($item && $item->order_id == $order->id) {
							$item->update([
								'product_name' => $itemData['product_name'],
								'quantity' => $itemData['quantity'],
								'unit_price' => $itemData['unit_price'],
							]);
						}
					} else {
						$order->items()->create($itemData);
					}
				}
			}

			$order->load('items', 'statusLogs');
			$order->customer_email = $order->customer_email ?? '';
			$order->customer_phone = $order->customer_phone ?? '';
			$order->allowed_transitions = $order->getAllowedTransitions();

			return response()->json($order, 200);
		});
	}

	public function updateStatus(Request $request, Order $order)
	{
		$data = $request->validate([
			'status' => ['required', Rule::in(Order::STATUSES)],
			'message' => 'nullable|string|max:500',
		]);

		$newStatus = $data['status'];
		$message = $data['message'] ?? null;

		if ($order->status === $newStatus) {
			$order->load('items', 'statusLogs');
			$order->customer_email = $order->customer_email ?? '';
			$order->customer_phone = $order->customer_phone ?? '';
			$order->allowed_transitions = $order->getAllowedTransitions();
			return response()->json(['message' => 'El pedido ya está en estado ' . $newStatus, 'order' => $order], 200);
		}

		if (!$order->canChangeStatus($newStatus)) {
			return response()->json(['message' => 'Transición de estado inválida.'], 400);
		}

		return DB::transaction(function () use ($order, $newStatus, $message) {
			$order->status = $newStatus;
			$order->save();

			if (in_array($newStatus, ['CANCELLED', 'RETURNED'])) {
				$defaultMessage = $newStatus === 'CANCELLED' ? 'Cancelado por el sistema/usuario.' : 'Devuelto tras envío.';
				$order->statusLogs()->create(['status' => $newStatus, 'message' => $message ?? $defaultMessage]);
			}

			$order->load('items', 'statusLogs');
			$order->customer_email = $order->customer_email ?? '';
			$order->customer_phone = $order->customer_phone ?? '';
			$order->allowed_transitions = $order->getAllowedTransitions();

			return response()->json(['message' => 'Estado actualizado correctamente', 'order' => $order], 200);
		});
	}
}
