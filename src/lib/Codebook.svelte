<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import { codeColors, codeNames } from "../stores";
	import { color } from "../color";

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

	/** @type{HTMLCanvasElement}*/
	let canvasEl;
	/** @type{CanvasRenderingContext2D}*/
	let ctx;
	onMount(() => {
		ctx = canvasEl.getContext("2d");
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

	/**
	 * @param {number[][]} data
	 */
	function drawData(data) {
		const hex = colorScales(embeddings, d3.interpolateGreys);
		for (let i = 0; i < rows; ++i) {
			for (let j = 0; j < columns; ++j) {
				const x = i * w;
				const y = j * h;
				ctx.fillStyle = color(hex(data[i][j]), 0.4).toString();
				ctx.fillRect(x, y, w, h);
			}
		}
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
