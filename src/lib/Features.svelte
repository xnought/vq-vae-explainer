<script>
	import Prism from "./Prism.svelte";

	export let width;
	export let height;
	export let x = 0;
	export let y = 0;

	export let square = 115;
	export let strokeWidth = 2;
	export let opacity = 0.1;

	export let H = 7;
	export let W = 7;
	export let C = 16;

	export let mouseenter = (i, j) => {};
	export let mouseleave = () => {};

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
</script>

<svg {width} {height} {x} {y} style="overflow: visible;">
	<Prism
		x1={squareFront.x}
		y1={squareFront.y}
		x2={squareBack.x}
		y2={squareBack.y}
		prismFill="rgba(0,0,0,0.05)"
		prismFillDarker="rgba(0,0,0,0.1)"
		{square}
		squareFill="rgba(0,0,0,0.05)"
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
			<Prism
				{x1}
				{x2}
				{y1}
				{y2}
				square={miniSquare}
				stroke="rgba(0,0,0,0.1)"
				prismStroke="rgba(0,0,0,0.1)"
				prismFill="rgb(0,0,0,0.1)"
				squareFill="rgba(0,0,0,0.1)"
				hoverInteraction
				mouseenter={() => mouseenter(i, j)}
				{mouseleave}
			/>
			{#if j === 0}
				<line {x1} {y1} {x2} {y2} stroke="rgb(0,0,0,0.1)" />
			{/if}
			{#if i === W - 1}
				<line
					x1={x1 + miniSquare}
					{y1}
					x2={x2 + miniSquare}
					{y2}
					stroke="rgb(0,0,0,0.1)"
				/>
			{/if}
		{/each}
	{/each}
</svg>

<style>
</style>
