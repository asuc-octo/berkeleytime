/* eslint-disable @typescript-eslint/no-explicit-any */

export default function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
) {
	let timeout: number | undefined;
	return (...args: any[]) => {
		if (!timeout) func(...args);
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}
