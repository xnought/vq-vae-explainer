<script>
	import { codeColors, codeNames } from "../stores";
	import { color } from "../color";
	import Matrix from "./Matrix.svelte";

	export let width;
	export let height;
	export let x = 0;
	export let y = 0;
	export let embeddings;
	export let hoveringColumn = undefined;
	export let showMatrix = true;

	$: rows = embeddings.length;
	$: columns = embeddings[0].length;
	let w, h;
</script>

<div style="position: relative; width: {width}px; height: {height}px;">
	<Matrix
		shape={["embed_dim ->", "num_embed ->"]}
		shapeOffset={[12, -8]}
		{width}
		{height}
		data={embeddings}
		bind:w
		bind:h
		showData={showMatrix}
	/>
	<svg
		{width}
		{height}
		{x}
		{y}
		style="position: absolute; left: 0; top: 0; overflow: visible;"
	>
		<rect {width} {height} fill="none" stroke="black" />
		{#if w && h}
			{#each { length: columns } as _, i}
				{#if hoveringColumn === i || true}
					{@const x = w * i}
					{@const o = hoveringColumn === i ? 1.0 : 0.4}
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
						class="qcode"
						x={x + w / 2}
						y={height + 13}
						fill={codeColors[i]}
						style="fill: {codeColors[i]}"
						stroke={hoveringColumn === i ? codeColors[i] : "none"}
						opacity={o}
						text-anchor="middle">{codeNames[i]}</text
					>
				{/if}
			{/each}
		{/if}
	</svg>
</div>

<style>
	text {
		font-size: 12px;
	}
</style>
