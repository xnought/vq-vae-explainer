<script>
	import { codeColors, codeNames } from "../stores";
	import { color } from "../color";
	import Matrix from "./Matrix.svelte";

	export let width;
	export let height;
	export let x = 0;
	export let y = 0;
	export let embeddings;
	export let rows = 16;
	export let columns = 16;
	export let hoveringColumn = undefined;

	const w = width / rows;
	const h = height / columns;
</script>

<div style="position: relative; width: {width}px; height: {height}px;">
	<svg
		{width}
		{height}
		{x}
		{y}
		style="position: absolute; left: 0; top: 0; overflow: visible;"
	>
		<rect {width} {height} fill="none" stroke="black" />
		{#each { length: columns } as _, i}
			{#if hoveringColumn === i || true}
				{@const x = w * i}
				{@const o = hoveringColumn === i ? 1.0 : 0.2}
				<rect
					{x}
					width={w}
					{height}
					fill={color(codeColors[i], 0.6).toString()}
					stroke={codeColors[i]}
					opacity={o}
					stroke-width={2}
				/>
				<text
					x={x + w / 2}
					y={height + 13}
					fill={codeColors[i]}
					opacity={o}
					text-anchor="middle">{codeNames[i]}</text
				>
			{/if}
		{/each}
	</svg>
	{#if embeddings}
		<Matrix {width} {height} data={embeddings} />
	{/if}
</div>

<style>
	text {
		font-family: menlo;
		font-size: 12px;
	}
</style>
