<script>
	import Matrix from "./Matrix.svelte";
	import { hovering } from "../stores";
	import { codeColors } from "../stores";

	export let argmin;
	export let width = 10;
	export let height = 300;

	function mapI(x, y) {
		const s = 7;
		return x * s + y;
	}
	function unmapI2(i) {
		const s = 7;
		const y = i % s;
		const x = (i - y) / s;
		return [x, y];
	}

	function unmapI(i) {
		const s = 7;
		for (let x = 0; x < s; ++x) {
			for (let y = 0; y < s; ++y) {
				if (mapI(x, y) === i) return [x, y];
			}
		}
	}

	$: h = height / argmin.length;
	let iHover;
	$: if ($hovering) iHover = mapI($hovering[0], $hovering[1]);
	else iHover = undefined;
</script>

<div>Argmin</div>
<div style="position: relative;">
	<svg {width} {height} on:mouseleave={() => ($hovering = undefined)}>
		{#each { length: argmin.length } as _, i}
			<rect
				x={0}
				y={i * h}
				{width}
				height={h}
				fill={codeColors[argmin[i]]}
				stroke="black"
				opacity={iHover === i ? 1 : 0.2}
				on:mouseenter={() => ($hovering = unmapI2(i))}
			/>
		{/each}
	</svg>
</div>
