<script>
	import Matrix from "./Matrix.svelte";
	import { hovering } from "../stores";

	export let features;
	export let width = 200;
	export let height = 500;
	export let color = "white";
	export let style = "";

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

	let w, h, iHover;
	$: if ($hovering) iHover = mapI($hovering[0], $hovering[1]);
	else iHover = undefined;
</script>

<div style="position: relative;{style}">
	<svg
		style="position: absolute; left: 0; top: 0;"
		{width}
		{height}
		on:mouseleave={() => ($hovering = undefined)}
	>
		{#if w && h}
			{#each { length: features.length } as _, i}
				<rect
					x={0}
					y={i * h}
					{width}
					height={h}
					fill={iHover === i ? color : "transparent"}
					stroke={iHover === i ? color : "transparent"}
					fill-opacity={0.3}
					stroke-width={2}
					on:mouseenter={() => ($hovering = unmapI2(i))}
				/>
			{/each}
		{/if}
	</svg>
	<Matrix data={features} {width} {height} bind:w bind:h />
</div>
