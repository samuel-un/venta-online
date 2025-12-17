import { useState } from "react";
import { createOrder, updateOrder } from "../services/orderService";

const TrashIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
		className="w-5 h-5 sm:w-4 sm:h-4"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
		/>
	</svg>
);

export default function OrderForm({ onSuccess, order }) {
	const isEditable = !order || order.status === "CREATED";
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [form, setForm] = useState(
		order || {
			customer_name: "",
			customer_email: "",
			customer_phone: "",
			items: [{ product_name: "", quantity: 1, unit_price: 0 }],
		}
	);

	const handleItemChange = (index, field, value) => {
		const newItems = [...form.items];
		newItems[index][field] =
			field === "quantity" || field === "unit_price"
				? Number(value)
				: value;
		setForm({ ...form, items: newItems });
	};

	const addItem = () => {
		if (!isEditable) return;
		setForm({
			...form,
			items: [
				...form.items,
				{ product_name: "", quantity: 1, unit_price: 0 },
			],
		});
	};

	const removeItem = (index) => {
		if (!isEditable) return;
		if (form.items.length === 1) {
			alert("Se requiere al menos un artículo en el pedido.");
			return;
		}
		const newItems = form.items.filter((_, i) => i !== index);
		setForm({ ...form, items: newItems });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isEditable || isSubmitting) return;

		if (form.items.length === 0) {
			alert("Debes añadir al menos un producto.");
			return;
		}

		setIsSubmitting(true);
		const total_amount = form.items.reduce(
			(sum, item) => sum + item.quantity * item.unit_price,
			0
		);
		const payload = { ...form, total_amount };

		try {
			if (order) await updateOrder(order.id, payload);
			else await createOrder(payload);

			onSuccess();
			if (!order) {
				setForm({
					customer_name: "",
					customer_email: "",
					customer_phone: "",
					items: [{ product_name: "", quantity: 1, unit_price: 0 }],
				});
			}
		} catch (err) {
			alert(
				err.response?.data?.message || "Error al procesar el pedido."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const totalCalculated = form.items.reduce(
		(sum, item) => sum + item.quantity * item.unit_price,
		0
	);

	return (
		<div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 w-full">
			<div className="bg-gray-50/80 backdrop-blur-sm px-4 sm:px-5 py-4 border-b border-gray-200">
				<h3 className="text-lg font-bold text-gray-800">
					{order ? `Editar ${order.order_number}` : "Crear Pedido"}
				</h3>
			</div>

			<form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-5">
				<div className="space-y-4">
					<div>
						<label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
							Nombre del Cliente
						</label>
						<input
							placeholder="Ej. Empresa S.L."
							value={form.customer_name}
							onChange={(e) =>
								setForm({
									...form,
									customer_name: e.target.value,
								})
							}
							required
							disabled={!isEditable}
							className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm py-2 px-3 border disabled:bg-gray-100 transition-all placeholder-gray-300"
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
								Email <span className="text-red-500">*</span>
							</label>
							<input
								type="email"
								placeholder="contacto@empresa.com"
								value={form.customer_email}
								onChange={(e) =>
									setForm({
										...form,
										customer_email: e.target.value,
									})
								}
								required
								disabled={!isEditable}
								className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm py-2 px-3 border disabled:bg-gray-100 invalid:border-red-300 invalid:text-red-600 transition-all placeholder-gray-300"
							/>
						</div>
						<div>
							<label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
								Teléfono
							</label>
							<input
								placeholder="+34 600 000 000"
								value={form.customer_phone}
								onChange={(e) =>
									setForm({
										...form,
										customer_phone: e.target.value,
									})
								}
								disabled={!isEditable}
								className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm py-2 px-3 border disabled:bg-gray-100 transition-all placeholder-gray-300"
							/>
						</div>
					</div>
				</div>

				<div className="border-t border-gray-100 pt-5">
					<div className="flex justify-between items-center mb-4">
						<h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
							Artículos
							<span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
								{form.items.length}
							</span>
						</h4>
						{isEditable && (
							<button
								type="button"
								onClick={addItem}
								className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
							>
								+ Añadir
							</button>
						)}
					</div>

					<div className="space-y-3 max-h-[50vh] sm:max-h-[400px] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
						{form.items.map((item, i) => (
							<div
								key={i}
								className="group relative bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-indigo-300 transition-all w-full"
							>
								{isEditable && form.items.length > 1 && (
									<button
										type="button"
										onClick={() => removeItem(i)}
										className="absolute top-2 right-2 sm:-top-2 sm:-right-2 bg-white text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-full p-1.5 sm:p-1 shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10"
										title="Eliminar artículo"
									>
										<TrashIcon />
									</button>
								)}

								<div className="space-y-3">
									<div className="pr-8 sm:pr-0">
										<label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
											Producto
										</label>
										<input
											placeholder="Nombre del producto"
											value={item.product_name}
											onChange={(e) =>
												handleItemChange(
													i,
													"product_name",
													e.target.value
												)
											}
											required
											disabled={!isEditable}
											className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border disabled:bg-gray-50"
										/>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
												Cant.
											</label>
											<input
												type="number"
												min="1"
												placeholder="1"
												value={item.quantity}
												onChange={(e) =>
													handleItemChange(
														i,
														"quantity",
														e.target.value
													)
												}
												required
												disabled={!isEditable}
												className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border text-center font-medium disabled:bg-gray-50"
											/>
										</div>
										<div>
											<label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
												Precio Unit.
											</label>
											<div className="relative rounded-md shadow-sm">
												<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
													<span className="text-gray-500 sm:text-sm">
														€
													</span>
												</div>
												<input
													type="number"
													min="0"
													step="0.01"
													placeholder="0.00"
													value={item.unit_price}
													onChange={(e) =>
														handleItemChange(
															i,
															"unit_price",
															e.target.value
														)
													}
													required
													disabled={!isEditable}
													className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 pr-3 border text-right font-medium disabled:bg-gray-50"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="pt-2 sticky bottom-0 bg-white pb-2 sm:static">
					<div className="flex flex-col sm:flex-row justify-between items-center bg-gray-900 text-white p-4 rounded-xl shadow-lg ring-1 ring-gray-900/5 gap-3 sm:gap-0">
						<div className="flex flex-col w-full sm:w-auto text-center sm:text-left">
							<span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
								Total Estimado
							</span>
							<span className="text-2xl font-bold tracking-tight">
								{totalCalculated.toLocaleString("es-ES", {
									style: "currency",
									currency: "EUR",
								})}
							</span>
						</div>
						{isEditable && (
							<button
								type="submit"
								disabled={isSubmitting}
								className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${
									isSubmitting
										? "bg-gray-700 text-gray-400 cursor-not-allowed"
										: "bg-indigo-600 hover:bg-indigo-500 text-white"
								}`}
							>
								{isSubmitting
									? "Guardando..."
									: order
									? "Guardar Cambios"
									: "Crear Pedido"}
							</button>
						)}
					</div>
				</div>
			</form>
		</div>
	);
}
