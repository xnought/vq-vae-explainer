<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import { color } from "../color";

	export let width;
	export let height;
	export let data;
	export let rows = data.length;
	export let columns = data[0].length;
	export let dataOpacity = 1;
	// "row" or "auto"
	export let scaleApply = "row";
	export let interp = d3.interpolateGreys;
	export let showData = true;
	export let shape = ["", ""];
	export let shapeOffset = [0, 0];

	// just to propagate upwards
	export let h = height / rows;
	export let w = width / columns;

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
	function colorScales(data, fixed) {
		if (fixed === undefined) {
			let min = data[0][0];
			let max = min;
			for (let i = 0; i < data.length; ++i) {
				for (let j = 0; j < data[0].length; ++j) {
					const d = data[i][j];
					if (d < min) {
						min = d;
					}
					if (d > max) {
						max = d;
					}
				}
			}
			const scale = d3.scaleLinear().domain([min, max]).range([1, 0]);
			return scale;
		} else {
			return d3.scaleLinear().domain(fixed).range([1, 0]);
		}
	}

	function drawData(data) {
		let scale = colorScales(data);
		for (let i = 0; i < rows; ++i) {
			if (scaleApply === "row") {
				scale = colorScales([data[i]]);
			}
			for (let j = 0; j < columns; ++j) {
				const x = j * w;
				const y = i * h;
				ctx.fillStyle = color(
					interp(scale(data[i][j])),
					dataOpacity
				).toString();
				ctx.fillRect(x, y, w, h);

				// these are terribly slow for some reason
				// ctx.fillStyle = "lightgrey";
				// ctx.strokeRect(x, y, w, h);
			}
		}
	}

	function clearCanvas() {
		ctx.clearRect(0, 0, width, height);
	}

	$: if (ctx && data && showData) drawData(data);
	$: if (ctx && showData === false) clearCanvas();
</script>

<div style="position: relative;">
	<canvas bind:this={canvasEl} {width} {height} />
	<div
		style="position: absolute; bottom: {30}px; left: -{shapeOffset[1] +
			45}px; font-size: 8px;"
		class="code min"
	>
		<div style="transform: rotate(-90deg);">
			{shape[0]}
		</div>
	</div>
	<div
		style="position: absolute; bottom: -{shapeOffset[0] +
			15}px; left: 0; font-size: 8px"
		class="code min"
	>
		{shape[1]}
	</div>
</div>
