<script>
	import Matrix from "./Matrix.svelte";
	import { hovering } from "../stores";
	import { codeColors } from "../stores";
	import { color } from "../color";

	export let argmin;
	export let quantized;
	export let style = "";

	export let width = 200;
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

	let h, w;
	let iHover;
	$: if ($hovering) iHover = mapI($hovering[0], $hovering[1]);
	else iHover = undefined;
</script>

<div style="position: relative;{style}">
	<svg
		{width}
		{height}
		on:mouseleave={() => ($hovering = undefined)}
		style="position: absolute; left: 0; top: 0;"
	>
		{#if h && w}
			{#each { length: argmin.length } as _, i}
				<g opacity={iHover === i || !$hovering ? 1.0 : 0.4}>
					<rect
						x={0}
						y={i * h}
						{width}
						height={h}
						fill={color(codeColors[argmin[i]], 0.6).toString()}
						stroke={codeColors[argmin[i]]}
						stroke-width={2}
						on:mouseenter={() => ($hovering = unmapI2(i))}
					/>
				</g>
			{/each}
		{/if}
	</svg>

	<Matrix data={quantized} {width} {height} bind:w bind:h />
</div>
