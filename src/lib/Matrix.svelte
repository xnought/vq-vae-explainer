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
	export let scale = colorScales(data, [-0.05, 0.05]);
	export let interp = d3.interpolateGreys;

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
			return scale;
		} else {
			return d3.scaleLinear().domain(fixed).range([0, 1]);
		}
	}

	function drawData() {
		const hex = (x) => interp(scale(x));
		for (let i = 0; i < rows; ++i) {
			for (let j = 0; j < columns; ++j) {
				const x = j * w;
				const y = i * h;
				ctx.fillStyle = color(hex(data[i][j]), dataOpacity).toString();
				ctx.fillRect(x, y, w, h);
				ctx.fillStyle = "lightgrey";
				ctx.strokeRect(x, y, w, h);
			}
		}
	}

	$: if (ctx && data) drawData();
</script>

<canvas bind:this={canvasEl} {width} {height} />
