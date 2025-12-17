import { useState, useEffect } from "react";
import StatusSelector from "./StatusSelector";
import { updateOrderStatus, updateOrder } from "../services/orderService";
import Swal from "sweetalert2";

const getStatusBadgeStyles = (status) => {
	switch (status) {
		case "CREATED":
			return "bg-blue-50 text-blue-700 ring-blue-600/20";
		case "CONFIRMED":
			return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
		case "SHIPPED":
			return "bg-purple-50 text-purple-700 ring-purple-600/20";
		case "DELIVERED":
			return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
		case "CANCELLED":
			return "bg-red-50 text-red-700 ring-red-600/20";
		case "RETURNED":
			return "bg-orange-50 text-orange-700 ring-orange-600/20";
		default:
			return "bg-gray-50 text-gray-600 ring-gray-500/10";
	}
};

export default function OrdersList({
	orders,
	pagination,
	onPageChange,
	refresh,
	onSearch,
}) {
	const [editedOrders, setEditedOrders] = useState({});
	const [localSearch, setLocalSearch] = useState("");

	const Toast = Swal.mixin({
		toast: true,
		position: "top-end",
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
		customClass: {
			popup: "rounded-lg border border-gray-100 shadow-xl",
		},
	});

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (onSearch) {
				onSearch(localSearch);
			}
		}, 500);
		return () => clearTimeout(timeoutId);
	}, [localSearch]);

	if (!orders || (orders.length === 0 && !localSearch)) {
		return (
			<div className="space-y-6 pb-20 sm:pb-12">
				<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg
								className="h-5 w-5 text-gray-400"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<input
							type="text"
							className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
							placeholder="Buscar por Pedido (ES...) o Email..."
							value={localSearch}
							onChange={(e) => setLocalSearch(e.target.value)}
						/>
					</div>
				</div>
				<div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center mx-4">
					<div className="bg-gray-50 p-4 rounded-full mb-4">
						<svg
							className="w-8 h-8 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
							/>
						</svg>
					</div>
					<h3 className="text-gray-900 font-medium text-lg">
						No hay pedidos registrados
					</h3>
					<p className="text-gray-500 text-sm mt-1">
						Crea un nuevo pedido desde el formulario para comenzar.
					</p>
				</div>
			</div>
		);
	}

	const handleChange = (orderId, field, value) => {
		setEditedOrders((prev) => ({
			...prev,
			[orderId]: { ...prev[orderId], [field]: value ?? "" },
		}));
	};

	const handleItemChange = (orderId, index, field, value) => {
		const orderEdits = editedOrders[orderId] || {};
		const originalItems = orders.find((o) => o.id === orderId).items;
		const items = orderEdits.items
			? [...orderEdits.items]
			: [...originalItems];
		items[index][field] =
			field === "quantity" || field === "unit_price"
				? Number(value)
				: value ?? "";
		setEditedOrders((prev) => ({
			...prev,
			[orderId]: { ...orderEdits, items },
		}));
	};

	const addItem = (orderId) => {
		const orderEdits = editedOrders[orderId] || {};
		const originalItems = orders.find((o) => o.id === orderId).items;
		const items = orderEdits.items
			? [...orderEdits.items]
			: [...originalItems];
		items.push({ product_name: "", quantity: 1, unit_price: 0 });
		setEditedOrders((prev) => ({
			...prev,
			[orderId]: { ...orderEdits, items },
		}));
	};

	const removeItem = (orderId, index) => {
		const orderEdits = editedOrders[orderId] || {};
		const originalItems = orders.find((o) => o.id === orderId).items;
		const items = orderEdits.items
			? [...orderEdits.items]
			: [...originalItems];
		if (items.length <= 1) {
			Toast.fire({
				icon: "info",
				title: "Se requiere al menos un producto",
			});
			return;
		}
		const newItems = items.filter((_, i) => i !== index);
		setEditedOrders((prev) => ({
			...prev,
			[orderId]: { ...orderEdits, items: newItems },
		}));
	};

	const handleUpdate = async (orderId) => {
		const edits = editedOrders[orderId];
		if (!edits) return;
		try {
			const order = orders.find((o) => o.id === orderId);
			const payload = {
				customer_name: edits.customer_name ?? order.customer_name,
				customer_email: edits.customer_email ?? order.customer_email,
				customer_phone: edits.customer_phone ?? order.customer_phone,
				items: edits.items ?? order.items,
			};

			await updateOrder(orderId, payload);
			Toast.fire({ icon: "success", title: "Pedido actualizado" });
			setEditedOrders((prev) => {
				const newEdits = { ...prev };
				delete newEdits[orderId];
				return newEdits;
			});
			refresh();
		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "No se pudieron guardar los cambios.",
				customClass: {
					popup: "rounded-xl border border-gray-100",
					confirmButton:
						"bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium",
				},
			});
		}
	};

	const handleStatusChange = async (order, newStatus) => {
		let message = null;

		if (["CANCELLED", "RETURNED"].includes(newStatus)) {
			const isCancelled = newStatus === "CANCELLED";

			const stateConfig = {
				CANCELLED: {
					label: "Cancelar pedido",
					color: "red",
					icon: "✖",
					placeholder:
						"Ej. El cliente solicitó la cancelación del pedido",
				},
				RETURNED: {
					label: "Devolver pedido",
					color: "orange",
					icon: "↩",
					placeholder:
						"Ej. El pedido fue devuelto por el transportista",
				},
			}[newStatus];

			const { value: text, isConfirmed } = await Swal.fire({
				title: "",
				html: `
				<div class="flex flex-col gap-6 text-left">
								
				<!-- Header -->
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
					<svg
						class="h-6 w-6 text-red-600"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M12 9v4" />
						<path d="M12 17h.01" />
						<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
					</svg>
				</div>

					<div>
						<h3 class="text-lg font-semibold text-gray-900">
							${stateConfig.label}
						</h3>
						<p class="text-sm text-gray-500">
							Pedido <span class="font-medium text-gray-900">${order.order_number}</span>
						</p>
					</div>
				</div>

				<!-- Description -->
				<p class="text-sm text-gray-600 leading-relaxed">
					Este cambio de estado quedará registrado en el historial del pedido
					y no podrá deshacerse. Por favor, indica el motivo del cambio.
				</p>

				<!-- Input -->
				<div>
					<label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
						Motivo del cambio <span class="text-red-500">*</span>
					</label>
					<textarea
						id="swal-reason-input"
						class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none min-h-[110px]"
						placeholder="${stateConfig.placeholder}"
					></textarea>
				</div>
			</div>
		`,
				showCancelButton: true,
				confirmButtonText: "Confirmar cambio",
				cancelButtonText: "Cancelar",
				reverseButtons: true,
				focusConfirm: false,
				buttonsStyling: false,
				customClass: {
					container: "font-sans backdrop-blur-sm",
					popup: "rounded-2xl border border-gray-100 shadow-2xl p-6 sm:p-8 max-w-lg",
					actions: "mt-6 flex w-full gap-3 flex-row-reverse",
					confirmButton:
						"flex-1 inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition",
					cancelButton:
						"flex-1 inline-flex justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition",
				},
				preConfirm: () => {
					const value = document
						.getElementById("swal-reason-input")
						.value.trim();
					if (!value) {
						Swal.showValidationMessage(
							'<span class="block text-sm text-red-600 font-medium mt-2">Debes indicar un motivo</span>'
						);
						return false;
					}
					return value;
				},
			});

			if (!isConfirmed) return;
			message = text;
		}

		try {
			await updateOrderStatus(order.id, newStatus, message);
			Toast.fire({
				icon: "success",
				title: `Nuevo Estado: ${newStatus}`,
			});
			refresh();
		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "Error",
				text:
					err.response?.data?.message ||
					"No se pudo cambiar el estado",
				customClass: {
					popup: "rounded-xl border border-gray-100 shadow-xl",
					confirmButton:
						"bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium",
				},
			});
		}
	};

	return (
		<div className="space-y-6 pb-20 sm:pb-12">
			<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<svg
							className="h-5 w-5 text-gray-400"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
					<input
						type="text"
						className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
						placeholder="Buscar por Pedido (ES...) o Email..."
						value={localSearch}
						onChange={(e) => setLocalSearch(e.target.value)}
					/>
				</div>
			</div>

			{orders.length === 0 && localSearch && (
				<div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
					No se encontraron resultados para "{localSearch}"
				</div>
			)}

			{orders.map((order) => {
				const edits = editedOrders[order.id] || {};
				const customer_name =
					edits.customer_name ?? order.customer_name ?? "";
				const customer_email =
					edits.customer_email ?? order.customer_email ?? "";
				const customer_phone =
					edits.customer_phone ?? order.customer_phone ?? "";
				const items = edits.items ?? order.items;
				const isEditable = order.status === "CREATED";
				const currentTotal = items.reduce(
					(sum, i) => sum + (i.quantity || 0) * (i.unit_price || 0),
					0
				);

				return (
					<div
						key={order.id}
						className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 w-full"
					>
						<div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
							<div className="flex flex-col w-full sm:w-auto">
								<div className="flex justify-between sm:justify-start items-center gap-3 mb-1">
									<span className="text-lg font-bold text-gray-900 tracking-tight font-mono">
										{order.order_number}
									</span>
									<span
										className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] sm:text-xs font-bold ring-1 ring-inset ${getStatusBadgeStyles(
											order.status
										)}`}
									>
										{order.status}
									</span>
								</div>
								<span className="text-xs text-gray-500 font-medium">
									{new Date(order.created_at).toLocaleString(
										"es-ES",
										{
											dateStyle: "medium",
											timeStyle: "short",
										}
									)}
								</span>
							</div>
							<div className="w-full sm:w-auto">
								<StatusSelector
									currentStatus={order.status}
									allowed={order.allowed_transitions}
									onChange={(newStatus) =>
										handleStatusChange(order, newStatus)
									}
								/>
							</div>
						</div>

						<div className="p-4 sm:p-6">
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
								<div>
									<label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
										Cliente
									</label>
									{isEditable ? (
										<input
											value={customer_name}
											onChange={(e) =>
												handleChange(
													order.id,
													"customer_name",
													e.target.value
												)
											}
											className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 border"
										/>
									) : (
										<p className="text-sm font-semibold text-gray-900 truncate">
											{customer_name}
										</p>
									)}
								</div>
								<div>
									<label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
										Email
									</label>
									{isEditable ? (
										<input
											value={customer_email}
											onChange={(e) =>
												handleChange(
													order.id,
													"customer_email",
													e.target.value
												)
											}
											className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 border"
										/>
									) : (
										<p className="text-sm text-gray-700 truncate">
											{customer_email}
										</p>
									)}
								</div>
								<div>
									<label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
										Teléfono
									</label>
									{isEditable ? (
										<input
											value={customer_phone}
											onChange={(e) =>
												handleChange(
													order.id,
													"customer_phone",
													e.target.value
												)
											}
											className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 border"
										/>
									) : (
										<p className="text-sm text-gray-700 font-mono">
											{customer_phone || "—"}
										</p>
									)}
								</div>
							</div>

							<div className="border border-gray-100 rounded-lg overflow-hidden">
								<table className="min-w-full divide-y divide-gray-100">
									<thead className="bg-gray-50/50 hidden md:table-header-group">
										<tr>
											<th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/2">
												Producto
											</th>
											<th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
												Cant.
											</th>
											<th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
												Precio
											</th>
											<th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
												Total
											</th>
											{isEditable && (
												<th className="w-10 px-2"></th>
											)}
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-100 block md:table-row-group">
										{items.map((item, index) => (
											<tr
												key={index}
												className="group hover:bg-gray-50/50 transition-colors block md:table-row border-b md:border-b-0 last:border-0 p-4 md:p-0"
											>
												<td className="px-0 md:px-4 py-1 md:py-3 align-top block md:table-cell">
													{isEditable ? (
														<div className="flex flex-col">
															<label className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">
																Producto
															</label>
															<input
																value={
																	item.product_name
																}
																onChange={(e) =>
																	handleItemChange(
																		order.id,
																		index,
																		"product_name",
																		e.target
																			.value
																	)
																}
																className="w-full text-sm border-gray-300 rounded-md px-2 py-1 border"
															/>
														</div>
													) : (
														<span className="text-sm text-gray-700 font-medium">
															{item.product_name}
														</span>
													)}
												</td>
												<td className="block md:table-cell px-0 md:px-4 py-2 md:py-3">
													<div className="flex md:hidden justify-between items-center gap-4 mt-2">
														<div className="flex flex-col w-1/4">
															<label className="text-[10px] font-bold text-gray-400 uppercase">
																Cant.
															</label>
															{isEditable ? (
																<input
																	type="number"
																	value={
																		item.quantity
																	}
																	onChange={(
																		e
																	) =>
																		handleItemChange(
																			order.id,
																			index,
																			"quantity",
																			e
																				.target
																				.value
																		)
																	}
																	className="w-full text-center text-sm border-gray-300 rounded-md py-1 border"
																/>
															) : (
																<span className="text-sm text-gray-600">
																	{
																		item.quantity
																	}
																</span>
															)}
														</div>
														<div className="flex flex-col w-1/3 text-right">
															<label className="text-[10px] font-bold text-gray-400 uppercase">
																Precio
															</label>
															{isEditable ? (
																<input
																	type="number"
																	value={
																		item.unit_price
																	}
																	onChange={(
																		e
																	) =>
																		handleItemChange(
																			order.id,
																			index,
																			"unit_price",
																			e
																				.target
																				.value
																		)
																	}
																	className="w-full text-right text-sm border-gray-300 rounded-md py-1 border"
																/>
															) : (
																<span className="text-sm text-gray-600 font-mono">
																	{Number(
																		item.unit_price
																	).toLocaleString(
																		"es-ES",
																		{
																			style: "currency",
																			currency:
																				"EUR",
																		}
																	)}
																</span>
															)}
														</div>
														<div className="flex flex-col w-1/3 text-right">
															<label className="text-[10px] font-bold text-gray-400 uppercase">
																Total
															</label>
															<span className="text-sm font-bold text-gray-900">
																{(
																	item.quantity *
																	item.unit_price
																).toLocaleString(
																	"es-ES",
																	{
																		style: "currency",
																		currency:
																			"EUR",
																	}
																)}
															</span>
														</div>
													</div>
													<div className="hidden md:block text-center">
														{isEditable ? (
															<input
																type="number"
																value={
																	item.quantity
																}
																onChange={(e) =>
																	handleItemChange(
																		order.id,
																		index,
																		"quantity",
																		e.target
																			.value
																	)
																}
																className="w-16 text-center text-sm border-gray-300 rounded-md px-2 py-1 border"
															/>
														) : (
															<span className="text-sm text-gray-600">
																{item.quantity}
															</span>
														)}
													</div>
												</td>
												<td className="px-4 py-3 text-right align-top hidden md:table-cell">
													{isEditable ? (
														<input
															type="number"
															value={
																item.unit_price
															}
															onChange={(e) =>
																handleItemChange(
																	order.id,
																	index,
																	"unit_price",
																	e.target
																		.value
																)
															}
															className="w-24 text-right text-sm border-gray-300 rounded-md px-2 py-1 border"
														/>
													) : (
														<span className="text-sm text-gray-600 font-mono">
															{Number(
																item.unit_price
															).toLocaleString(
																"es-ES",
																{
																	style: "currency",
																	currency:
																		"EUR",
																}
															)}
														</span>
													)}
												</td>
												<td className="px-4 py-3 text-right align-top hidden md:table-cell">
													<span className="text-sm font-bold text-gray-900 font-mono">
														{(
															item.quantity *
															item.unit_price
														).toLocaleString(
															"es-ES",
															{
																style: "currency",
																currency: "EUR",
															}
														)}
													</span>
												</td>
												{isEditable && (
													<td className="px-0 md:px-2 py-0 md:py-3 text-right md:text-center align-middle block md:table-cell">
														<button
															onClick={() =>
																removeItem(
																	order.id,
																	index
																)
															}
															className="text-red-400 hover:text-red-600 p-2 md:p-1 border md:border-0 rounded border-red-100 bg-red-50 md:bg-transparent"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4 inline"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		2
																	}
																	d="M6 18L18 6M6 6l12 12"
																/>
															</svg>
														</button>
													</td>
												)}
											</tr>
										))}
									</tbody>
									<tfoot className="bg-gray-50/50">
										<tr>
											<td
												colSpan={isEditable ? 5 : 4}
												className="px-4 py-3 text-right"
											>
												<div className="flex justify-between md:justify-end items-center gap-3">
													<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
														Total Pedido
													</span>
													<span className="text-xl font-black text-gray-900 tracking-tight">
														{currentTotal.toLocaleString(
															"es-ES",
															{
																style: "currency",
																currency: "EUR",
															}
														)}
													</span>
												</div>
											</td>
										</tr>
									</tfoot>
								</table>
							</div>

							{isEditable && (
								<div className="flex flex-col sm:flex-row gap-3 justify-end mt-4 pt-2">
									<button
										onClick={() => addItem(order.id)}
										className="w-full sm:w-auto text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-3 rounded-lg"
									>
										+ Añadir Producto
									</button>
									<button
										onClick={() => handleUpdate(order.id)}
										className="w-full sm:w-auto bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-lg"
									>
										Guardar Cambios
									</button>
								</div>
							)}

							{order.status_logs &&
								order.status_logs.length > 0 && (
									<div className="mt-6 pt-6 border-t border-gray-100">
										<h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
											Historial de Actividad
										</h5>
										<div className="space-y-0 relative pl-2">
											<div className="absolute top-2 bottom-2 left-[4.5px] w-0.5 bg-gray-100"></div>
											{order.status_logs.map(
												(log, idx) => (
													<div
														key={idx}
														className="relative pl-6 pb-6 last:pb-0"
													>
														<div
															className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 ${getStatusBadgeStyles(
																log.status
															)
																.split(" ")[1]
																.replace(
																	"text-",
																	"bg-"
																)}`}
														></div>
														<div className="flex flex-col">
															<p className="text-sm text-gray-800 font-medium">
																<span className="font-bold">
																	{log.status}
																</span>
																{log.message && (
																	<span className="font-normal text-gray-500 block sm:inline sm:ml-1">
																		{" "}
																		—{" "}
																		{
																			log.message
																		}
																	</span>
																)}
															</p>
															<span className="text-[10px] text-gray-400 uppercase font-mono">
																{new Date(
																	log.created_at
																).toLocaleString(
																	"es-ES"
																)}
															</span>
														</div>
													</div>
												)
											)}
										</div>
									</div>
								)}
						</div>
					</div>
				);
			})}

			{pagination && pagination.total > pagination.per_page && (
				<div className="flex justify-between items-center bg-white px-4 py-3 border border-gray-200 rounded-lg shadow-sm">
					<div className="text-sm text-gray-700">
						Mostrando{" "}
						<span className="font-medium">{pagination.from}</span> a{" "}
						<span className="font-medium">{pagination.to}</span> de{" "}
						<span className="font-medium">{pagination.total}</span>{" "}
						resultados
					</div>
					<div className="flex gap-2">
						<button
							onClick={() =>
								onPageChange(pagination.current_page - 1)
							}
							disabled={!pagination.prev_page_url}
							className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Anterior
						</button>
						<button
							onClick={() =>
								onPageChange(pagination.current_page + 1)
							}
							disabled={!pagination.next_page_url}
							className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Siguiente
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
