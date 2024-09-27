<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";

	export let width;
	export let height;
	export let x = 0;
	export let y = 0;
	export let embeddings;
	export let rows = 16;
	export let columns = 16;
	export let hoveringColumn = undefined;
	export let showAllCodes = false;
	// export let codeColors = d3.schemeTableau10.concat(d3.schemeCategory10);
	export let codeColors = generateDiscreteColors(
		columns,
		d3.interpolatePlasma
	);
	export let codeNames = "0123456789ABCDEF";

	const w = width / rows;
	const h = height / columns;

	/** @type{HTMLCanvasElement}*/
	let canvasEl;
	/** @type{CanvasRenderingContext2D}*/
	let ctx;
	onMount(() => {
		ctx = canvasEl.getContext("2d");
		console.log(canvasEl.width);
		console.log(canvasEl.height);
	});

	/**
	 * @param {number[][]} data
	 */
	function colorScales(data, colorInterpolate) {
		let min = data[0][0];
		let max = min;
		for (let i = 0; i < rows; ++i) {
			for (let j = 0; j < columns; ++j) {
				const d = data[i][j];
				if (d < min) {
					min = d;
				}
				if (d > max) {
					max = d;
				}
			}
		}

		const scale = d3.scaleLinear().domain([min, max]).range([0, 1]);
		return (c) => {
			const rescaled = scale(c);
			return colorInterpolate(rescaled);
		};
	}

	function generateDiscreteColors(n, interp) {
		let out = Array(n);
		const s = d3
			.scaleLinear()
			.domain([0, n - 1])
			.range([0, 1]);
		for (let i = 0; i < n; i++) {
			out[i] = interp(s(i));
		}
		return out;
	}

	/**
	 * @param {number[][]} data
	 */
	function drawData(data) {
		const color = colorScales(embeddings, d3.interpolateGreys);
		for (let i = 0; i < rows; ++i) {
			for (let j = 0; j < columns; ++j) {
				const x = i * w;
				const y = j * h;
				ctx.fillStyle = color(data[i][j]);
				ctx.fillRect(x, y, w, h);
			}
		}
	}
	function color(c, alpha = 1) {
		const d3c = d3.color(c);
		d3c.opacity = alpha;
		return d3c;
	}

	$: if (ctx && embeddings) drawData(embeddings);
</script>

<div style="position: relative;">
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
	<canvas bind:this={canvasEl} {width} {height} />
</div>

<style>
	text {
		font-family: menlo;
		font-size: 12px;
	}
</style>
