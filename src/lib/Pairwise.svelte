<script>
	import Matrix from "./Matrix.svelte";
	import { codeColors, hovering } from "../stores";

	export let distances;
	export let argmin;
	export let width = 200;
	export let height = 500;
	export let style = "";
	export let color = "white";

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
	<Matrix
		data={distances}
		{width}
		{height}
		bind:w
		bind:h
		shape={["num_features ->", "num_embed ->"]}
	/>
	<svg
		style="position: absolute; left: 0; top: 0;"
		{width}
		{height}
		on:mouseleave={() => ($hovering = undefined)}
	>
		{#if w && h}
			{#each { length: distances.length } as _, i}
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
				<rect
					x={argmin[i] * w}
					y={i * h}
					width={w}
					height={h}
					stroke-width={2}
					stroke={codeColors[argmin[i]]}
					stroke-opacity={$hovering === undefined ||
					(unmapI2(i)[0] === $hovering[0] &&
						unmapI2(i)[1] === $hovering[1])
						? 1.0
						: 0.5}
				>
				</rect>
			{/each}
		{/if}
	</svg>
</div>
