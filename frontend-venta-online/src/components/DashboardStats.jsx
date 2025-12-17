import React from "react";

export default function DashboardStats({ stats }) {
	if (!stats) return null;

	const cards = [
		{
			title: "PENDIENTES DE ENTREGA",
			value: stats.pending_orders,
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			color: "bg-blue-500",
			textColor: "text-blue-600",
			bgColor: "bg-blue-50",
		},
		{
			title: "FACTURACIÓN TOTAL",
			value: Number(stats.revenue).toLocaleString("es-ES", {
				style: "currency",
				currency: "EUR",
			}),
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			color: "bg-emerald-500",
			textColor: "text-emerald-600",
			bgColor: "bg-emerald-50",
		},
		{
			title: "PEDIDOS REALIZADOS HOY",
			value: stats.orders_today,
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			),
			color: "bg-purple-500",
			textColor: "text-purple-600",
			bgColor: "bg-purple-50",
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			{cards.map((card, idx) => (
				<div
					key={idx}
					className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-all hover:shadow-md"
				>
					<div
						className={`p-4 rounded-full ${card.bgColor} ${card.textColor} mr-4`}
					>
						{card.icon}
					</div>
					<div>
						<p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
							{card.title}
						</p>
						<p className="text-2xl font-bold text-gray-900 mt-1">
							{card.value}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
