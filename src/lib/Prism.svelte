<script>
	export let square = 5;
	export let x1 = 0;
	export let x2 = 0;
	export let y1 = 0;
	export let y2 = 0;

	export let stroke = "black";
	export let prismStroke = "black";
	export let hoverInteraction = false;
	export let prismFill = "red";
	export let prismFillDarker = prismFill;
	export let squareFill = prismFill;
	export let showPrism = false;

	export let mouseenter = () => {};
	export let mouseleave = () => {};

	const squareFront = {
		x: x1,
		y: y1,
		width: square,
		height: square,
	};
	const squareBack = {
		x: x2,
		y: y2,
		width: square,
		height: square,
	};
	export let hovering = false;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<g
	on:mouseenter={() => {
		if (hoverInteraction) {
			hovering = true;
			mouseenter();
		}
	}}
	on:mouseleave={() => {
		if (hoverInteraction) {
			hovering = false;
			mouseleave();
		}
	}}
>
	<rect
		{...squareFront}
		fill={hovering || showPrism ? squareFill : "transparent"}
		{stroke}
	/>
	<rect {...squareBack} fill="none" {stroke} opacity={0.2} />

	{#if hovering || showPrism}
		<!-- side panel -->
		<polygon
			points="{squareFront.x + square},{squareFront.y} {squareBack.x +
				square},{squareBack.y} {squareBack.x + square},{squareBack.y +
				square} {squareFront.x + square}, {squareFront.y + square}"
			fill={hovering || showPrism ? prismFillDarker : "transparent"}
			stroke={prismStroke}
		/>
		<!-- top panel -->
		<polygon
			points="{squareFront.x},{squareFront.y} {squareFront.x +
				square},{squareFront.y} {squareBack.x +
				square},{squareBack.y} {squareBack.x}, {squareBack.y}"
			fill={hovering || showPrism ? prismFill : "transparent"}
			stroke={prismStroke}
		/>
		<!-- left side panel background line -->
		<line
			x1={squareFront.x}
			y1={squareFront.y + square}
			x2={squareBack.x}
			y2={squareBack.y + square}
			stroke={prismStroke}
			opacity={0.2}
		/>
	{/if}
</g>
