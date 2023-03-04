/**
 * Range from A to B
 */
export function range(a: number, b: number, step = 1): number[] {
	return Array(b - a)
		.fill(0)
		.map((_, i) => i + a);
}
