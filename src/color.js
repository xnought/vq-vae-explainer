import * as d3 from "d3";

export function generateDiscreteColors(n, interp) {
	let out = Array(n);
	const s = d3
		.scaleLinear()
		.domain([0, n - 1])
		.range([0, 1]);
	for (let i = 0; i < n; i++) {
		out[i] = interp(s(i));
	}
	return out;
}
export function color(c, alpha = 1) {
	const d3c = d3.color(c);
	d3c.opacity = alpha;
	return d3c;
}
