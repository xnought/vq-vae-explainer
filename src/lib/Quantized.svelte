<script>
	import { color } from "../color";
	import { codeNames, codeColors, hovering } from "../stores";

	export let width;
	export let height;
	export let x = 0;
	export let y = 0;
	export let idxs;
	export let rows = idxs.length;
	export let columns = idxs[0].length;

	$: w = width / columns;
	$: h = height / columns;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg
	{width}
	{height}
	{x}
	{y}
	style="overflow: visible;"
	on:mouseleave={() => ($hovering = undefined)}
>
	<rect {width} {height} fill="none" stroke="black" />
	{#each { length: rows } as _, i}
		{#each { length: columns } as _, j}
			{@const idx = idxs[i][j]}
			{@const c = codeColors[idx]}
			{@const x = i * w}
			{@const y = j * h}
			{@const isHovering =
				$hovering && $hovering[0] === i && $hovering[1] === j}
			<g
				opacity={isHovering || $hovering === undefined ? 1.0 : 0.6}
				on:mouseenter={() => ($hovering = [i, j])}
			>
				<rect {x} {y} width={w} height={h} fill={c} />G
				{#if isHovering}
					<text
						x={x + w / 2}
						y={y + h / 2 + 5}
						text-anchor="middle"
						style="font-family: menlo;"
						fill={"black"}>{codeNames[idx]}</text
					>
				{/if}
			</g>
		{/each}
	{/each}
</svg>

<style>
</style>
