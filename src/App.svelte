<script>
	import "./app.css";
	import Header from "./lib/Header.svelte";
	import ImageSelector from "./lib/ImageSelector.svelte";
	import MnistDigit from "./lib/digit/MnistDigit.svelte";
	import Codebook from "./lib/Codebook.svelte";
	import { Button } from "flowbite-svelte";
	import { TrashBinOutline } from "flowbite-svelte-icons";

	import { onDestroy, onMount } from "svelte";
	import { loadAllImages } from "./load";
	import * as tf from "@tensorflow/tfjs";
	import { VQVAE } from "./vectorQuantizer";
	import Features from "./lib/Features.svelte";
	import Matrix from "./lib/Matrix.svelte";
	import Quantized from "./lib/Quantized.svelte";
	import { hovering } from "./stores";
	import FeaturesReshape from "./lib/FeaturesReshape.svelte";
	import Pairwise from "./lib/Pairwise.svelte";
	import Argmin from "./lib/Argmin.svelte";
	import SelectEmbed from "./lib/SelectEmbed.svelte";
	import Sankey from "./lib/Sankey.svelte";

	const inputOutputCanvasSize = 300;
	const images = [1, 2, 3, 4, 5, 7].map((d) => `images/${d}.png`);
	let rawImages;
	let selectedImage = "images/1.png";

	// global model data
	let inputDigit = Array(784).fill(0);
	let outputDigit = Array(784).fill(0);
	let embeddings;
	let idxs;
	let features;
	let distances;
	let argmin;
	let quantized;

	/** @type {VQVAE}*/
	let model;

	onMount(async () => {
		rawImages = await loadAllImages(images);
		rawImages["clear"] = new Float32Array(784).fill(0);
		model = await VQVAE.load();
		embeddings = model.vq.embeddings.arraySync();
	});
	onDestroy(() => {
		model.dispose();
	});

	function forward(d) {
		tf.tidy(() => {
			const input = tf.tensor(d).reshape([1, 28, 28, 1]);
			const recon = model.predict(input);

			inputDigit = input.flatten().arraySync();
			outputDigit = recon.flatten().arraySync();
			idxs = model.vq.idxs.reshape([7, 7]).arraySync();
			features = model.vq.features.arraySync();
			distances = model.vq.distances.arraySync();
			argmin = model.vq.idxs.arraySync();
			quantized = model.vq.quantized.arraySync();
		});
	}

	$: if (model && selectedImage) forward(rawImages[selectedImage]);
	let featuresWidth = 150;
	let featuresHeight = 300;

	// svg positioning
	$: inputX = 0;
	$: inputEncoderGap = 30;

	$: encoderX = inputX + inputOutputCanvasSize + inputEncoderGap;
	$: encoderInHeight = inputOutputCanvasSize;
	$: encoderOutHeight = inputOutputCanvasSize / 2;
	$: encoderWidth = 100;
	$: encoderOutX = encoderX + encoderWidth;
	$: encoderOutY = inputOutputCanvasSize / 4;
	$: middleGap = 300;

	$: decoderX = middleGap + encoderOutX;
	$: decoderY = encoderOutY;
	$: decoderInHeight = encoderOutHeight;
	$: decoderOutHeight = encoderInHeight;
	$: decoderOutX = encoderWidth + decoderX;

	$: outputX = decoderOutX + inputEncoderGap;

	const sankeyColors = {
		stroke: "rgba(255,255,255,0.3)",
		fill: "rgba(255,255,255,0.05)",
	};
</script>

<Header />
<main class="p-5">
	<div class="mb-2 flex gap-2 items-center">
		<ImageSelector imageUrls={images} bind:selectedUrl={selectedImage} />
	</div>
	<svg>
		<foreignObject
			id="input"
			x={inputX}
			y={0}
			width={inputOutputCanvasSize}
			height={inputOutputCanvasSize + 100}
		>
			<MnistDigit
				data={inputDigit}
				square={inputOutputCanvasSize}
				maxVal={1}
				enableDrawing
				onChange={(d) => {
					forward(d);
				}}
			></MnistDigit>
			<Button
				class="mt-2"
				size="xs"
				color="alternative"
				on:click={() => {
					selectedImage = "clear";
					rawImages = rawImages; // weirdly needed for UI to update;
				}}><TrashBinOutline class="mr-1" size="sm" /> Clear</Button
			>
		</foreignObject>

		<g id="encoder">
			<text
				x={encoderX + encoderWidth / 2}
				y={inputOutputCanvasSize / 2}
				text-anchor="middle"
				style="fill: {sankeyColors.stroke}"
				class="code">Encoder</text
			>
			<Sankey
				p1={[encoderX, 0]}
				p1Height={encoderInHeight}
				p2={[encoderOutX, encoderOutY]}
				p2Height={encoderOutHeight}
				{...sankeyColors}
			/>
		</g>

		<g id="decoder">
			<text
				x={decoderX + encoderWidth / 2}
				y={inputOutputCanvasSize / 2}
				style="fill: {sankeyColors.stroke}"
				text-anchor="middle"
				class="code">Decoder</text
			>
			<Sankey
				p1={[decoderX, decoderY]}
				p1Height={decoderInHeight}
				p2={[decoderOutX, 0]}
				p2Height={decoderOutHeight}
				{...sankeyColors}
			/>
		</g>
		<foreignObject
			id="output"
			x={outputX}
			y={0}
			width={inputOutputCanvasSize}
			height={inputOutputCanvasSize + 100}
		>
			<MnistDigit
				data={outputDigit}
				square={inputOutputCanvasSize}
				maxVal={1}
			></MnistDigit>
		</foreignObject>
	</svg>

	<!-- <div class="mb-2 flex gap-2 items-center">
		<ImageSelector imageUrls={images} bind:selectedUrl={selectedImage} />
	</div>
	<div class="flex gap-5" id="tool">
		<div>
			<MnistDigit
				data={inputDigit}
				square={inputOutputCanvasSize}
				maxVal={1}
				enableDrawing
				onChange={(d) => {
					forward(d);
				}}
			></MnistDigit>
			<Button
				class="mt-2"
				size="xs"
				color="alternative"
				on:click={() => {
					selectedImage = "clear";
					rawImages = rawImages; // weirdly needed for UI to update;
				}}><TrashBinOutline class="mr-1" size="sm" /> Clear</Button
			>
		</div>
		<div>
			<Features width={200} height={200} square={125} />
			<div class="mt-5">
				{#if features && $hovering}
					<Matrix
						data={[features[$hovering[0] * 7 + $hovering[1]]]}
						width={140}
						height={200 / 16}
					/>
				{/if}
			</div>
		</div>
		<div>
			{#if features}
				<FeaturesReshape
					{features}
					width={featuresWidth}
					height={featuresHeight}
				/>
			{/if}
		</div>
		<div>
			<div>
				{#if embeddings}
					<Codebook
						width={250}
						height={150}
						{embeddings}
						hoveringColumn={idxs && $hovering
							? idxs[$hovering[0]][$hovering[1]]
							: undefined}
					/>
				{/if}
			</div>
			<div class="mt-20">
				{#if idxs}
					<Quantized width={150} height={150} {idxs} />
				{/if}
			</div>
		</div>
		<div>
			{#if distances}
				<Pairwise {distances} width={250} height={featuresHeight} />
			{/if}
		</div>

		<div>
			{#if argmin}
				<Argmin {argmin} height={featuresHeight} />
			{/if}
		</div>
		<div>
			{#if quantized}
				<SelectEmbed
					{quantized}
					{argmin}
					width={featuresWidth}
					height={featuresHeight}
				/>
			{/if}
		</div>

		<div>
			<Features width={200} height={200} square={125} />
		</div>
		<div>
			<MnistDigit
				data={outputDigit}
				square={inputOutputCanvasSize}
				maxVal={1}
			></MnistDigit>
		</div>
	</div> -->
</main>

<style>
	svg,
	foreignObject {
		overflow: visible;
	}
</style>
