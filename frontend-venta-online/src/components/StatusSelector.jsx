import React from "react";

export default function StatusSelector({ currentStatus, allowed, onChange }) {
	const isDisabled = allowed.length === 0;

	return (
		<div className="relative inline-block w-full sm:w-auto">
			<select
				value={currentStatus}
				onChange={(e) => onChange(e.target.value)}
				disabled={isDisabled}
				className={`block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
					isDisabled
						? "bg-gray-100 text-gray-400 cursor-not-allowed"
						: "bg-white shadow-sm cursor-pointer"
				}`}
			>
				<option value={currentStatus}>{currentStatus}</option>
				{allowed.map((status) => (
					<option key={status} value={status}>
						{status}
					</option>
				))}
			</select>
		</div>
	);
}
