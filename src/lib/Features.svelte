<script>
	import { color } from "../color";
	import { hovering } from "../stores";
	import Prism from "./Prism.svelte";

	export let width;
	export let height;
	export let x = 0;
	export let y = 0;

	export let square = 115;
	export let strokeWidth = 2;
	export let opacity = 0.1;
	export let colorOverrides = undefined;

	export let H = 7;
	export let W = 7;
	export let C = 16;

	const miniSquare = square / H;

	const squareFront = {
		x: 0,
		y: height - square,
		width: square,
		height: square,
	};
	const squareBack = {
		x: width - square,
		y: 0,
		width: square,
		height: square,
	};
	const prismColor = "rgba(255,255,255,0.4)";
	const bgPrismColor = "rgba(255,255,255,0.05)";
</script>

<svg
	{width}
	{height}
	{x}
	{y}
	style="overflow: visible;"
	on:mouseleave={() => ($hovering = undefined)}
>
	<Prism
		x1={squareFront.x}
		y1={squareFront.y}
		x2={squareBack.x}
		y2={squareBack.y}
		prismFill={bgPrismColor}
		prismFillDarker={color(prismColor, 0.2).toString()}
		{square}
		squareFill={bgPrismColor}
		showPrism
		stroke="lightgrey"
		prismStroke="lightgrey"
	/>

	{#each { length: H } as _, i}
		{@const x1 = squareFront.x + i * miniSquare}
		{@const x2 = squareBack.x + i * miniSquare}
		{#each { length: W } as _, j}
			{@const y1 = squareFront.y + j * miniSquare}
			{@const y2 = squareBack.y + j * miniSquare}
			{@const c = !colorOverrides ? prismColor : colorOverrides[i][j]}
			<Prism
				{x1}
				{x2}
				{y1}
				{y2}
				square={miniSquare}
				stroke={c}
				prismStroke={c}
				prismFill={c}
				squareFill={c}
				prismFillDarker={c}
				hoverInteraction
				mouseenter={() => ($hovering = [i, j])}
				hovering={$hovering
					? $hovering[0] === i && $hovering[1] === j
					: false}
			/>
			{#if j === 0}
				<line {x1} {y1} {x2} {y2} stroke={c} />
			{/if}
			{#if i === W - 1}
				<line
					x1={x1 + miniSquare}
					{y1}
					x2={x2 + miniSquare}
					{y2}
					stroke={c}
				/>
			{/if}
		{/each}
	{/each}
</svg>

<style>
</style>
