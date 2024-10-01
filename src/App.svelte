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
	import { codeColors, hovering } from "./stores";
	import FeaturesReshape from "./lib/FeaturesReshape.svelte";
	import Pairwise from "./lib/Pairwise.svelte";
	import Argmin from "./lib/Argmin.svelte";
	import SelectEmbed from "./lib/SelectEmbed.svelte";
	import Sankey from "./lib/Sankey.svelte";
	import Prism from "./lib/Prism.svelte";
	import { color } from "./color";
	import Pointer from "./lib/Pointer.svelte";

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

	function grabColorsForOutFeatures(idxs) {
		let result = [];
		for (let i = 0; i < idxs.length; ++i) {
			let sub = [];
			for (let j = 0; j < idxs[0].length; ++j) {
				sub.push(color(codeColors[idxs[i][j]], 0.5).toString());
			}
			result.push(sub);
		}
		return result;
	}

	$: if (model && selectedImage) forward(rawImages[selectedImage]);
	let featuresWidth = 150;
	let featuresHeight = 300;
	let codebookWidth = 250;
	let codebookHeight = 150;
	let prismSquare = 150;
	let prismSmallerSquare = 100;
	let argminWidth = 10;
	let expanded = false;
	let qvisSquare = 150;

	// svg positioning
	$: inputX = 0;
	$: inputEncoderGap = 10;

	$: encoderX = inputX + inputOutputCanvasSize + inputEncoderGap;
	$: encoderInHeight = inputOutputCanvasSize;
	$: encoderOutHeight = prismSquare;
	$: encoderWidth = 100;
	$: encoderOutX = encoderX + encoderWidth;
	$: encoderOutY = inputOutputCanvasSize - 75;

	$: inPrismX = encoderOutX + inputEncoderGap;
	$: inPrismY = encoderOutY;

	$: reshapeFeaturesX = inPrismX + prismSquare + inputEncoderGap;
	$: reshapeFeaturesY = inPrismY;

	$: codebookX = expanded
		? reshapeFeaturesX + featuresWidth + 3 * inputEncoderGap
		: inPrismX + prismSquare + inputEncoderGap;
	$: codebookY = 25;

	$: pairwiseX = codebookX;
	$: pairwiseY = reshapeFeaturesY;

	$: argminX = pairwiseX + codebookWidth + inputEncoderGap;
	$: argminY = reshapeFeaturesY;

	$: quantizedX = argminX + argminWidth + 3 * inputEncoderGap;
	$: quantizedY = reshapeFeaturesY;

	$: outPrismX = expanded
		? quantizedX + featuresWidth + inputEncoderGap
		: codebookX + codebookWidth + inputEncoderGap;
	$: outPrismY = inPrismY;

	$: qvisX = expanded
		? quantizedX
		: codebookX + codebookWidth / 2 - qvisSquare / 2;
	$: qvisY = expanded ? quantizedY + featuresHeight + 30 : inPrismY;

	$: decoderX = outPrismX + prismSquare + inputEncoderGap;
	$: decoderY = encoderOutY;
	$: decoderInHeight = encoderOutHeight;
	$: decoderOutHeight = encoderInHeight;
	$: decoderOutX = encoderWidth + decoderX;

	$: outputX = decoderOutX + inputEncoderGap;

	const sankeyColors = {
		stroke: "rgba(255,255,255,0.3)",
		fill: "rgba(255,255,255,0.05)",
	};
	const mnistStyle = {
		style: `outline: 2px solid ${sankeyColors.stroke}; border-radius: 1px;`,
	};
</script>

<Header />
<main class="p-5">
	<div class="mb-2">
		<div class="mb-1 flex gap-1 out">
			<Pointer /> <b>Select an input</b> or draw by dragging on the canvas
		</div>
		<ImageSelector imageUrls={images} bind:selectedUrl={selectedImage} />
	</div>
	<svg style="margin-top: 40px;">
		<text x={inputX} y={-7} class="code">input </text>
		<foreignObject
			id="input"
			x={inputX}
			y={0}
			width={inputOutputCanvasSize}
			height={inputOutputCanvasSize + 100}
		>
			<MnistDigit
				{...mnistStyle}
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
				}}
			>
				Clear input drawing <TrashBinOutline
					class="ml-1"
					size="sm"
				/></Button
			>
		</foreignObject>

		<g id="encoder">
			<text
				x={encoderX + encoderWidth / 2}
				y={encoderOutY + prismSmallerSquare / 2}
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

		<svg x={inPrismX} y={inPrismY + prismSquare + 18}>
			<text x={0} y={0} class="code"> features </text>
			<text x={25 + 5} y={25} class="code out">
				<tspan x={25 + 5} dy="0"> hover features to see</tspan>
				<tspan x={25 + 5} dy="15">
					closest codes and quantization</tspan
				>
			</text>
			<Pointer y={8} />
		</svg>
		<Features
			x={inPrismX}
			y={inPrismY}
			width={prismSquare}
			height={prismSquare}
			square={prismSmallerSquare}
		/>

		<text x={codebookX} y={codebookY - 7} class="code"
			>embeddings <tspan class="min">(codebook)</tspan></text
		>
		<foreignObject x={codebookX} y={codebookY} width={250} height={150}>
			{#if embeddings}
				<Codebook
					width={250}
					height={150}
					{embeddings}
					showMatrix={expanded}
					hoveringColumn={idxs && $hovering
						? idxs[$hovering[0]][$hovering[1]]
						: undefined}
				/>
			{/if}
		</foreignObject>

		{#if expanded}
			<g class="fade-in">
				<foreignObject
					x={reshapeFeaturesX}
					y={reshapeFeaturesY}
					width={featuresWidth}
					height={featuresHeight}
				>
					{#if features}
						<FeaturesReshape
							{features}
							width={featuresWidth}
							height={featuresHeight}
						/>
					{/if}
				</foreignObject>
				<foreignObject
					x={pairwiseX}
					y={pairwiseY}
					width={codebookWidth}
					height={featuresHeight}
				>
					{#if distances}
						<Pairwise
							{distances}
							width={codebookWidth}
							height={featuresHeight}
						/>
					{/if}
				</foreignObject>
				<foreignObject
					x={argminX}
					y={argminY}
					width={argminWidth}
					height={featuresHeight}
				>
					{#if argmin}
						<Argmin
							{argmin}
							height={featuresHeight}
							width={argminWidth}
						/>
					{/if}
				</foreignObject>
				<foreignObject
					x={quantizedX}
					y={quantizedY}
					width={featuresWidth}
					height={featuresHeight}
				>
					{#if quantized}
						<SelectEmbed
							{quantized}
							{argmin}
							width={featuresWidth}
							height={featuresHeight}
						/>
					{/if}
				</foreignObject>
			</g>
		{/if}

		{#if idxs && !expanded}
			<Quantized
				x={qvisX}
				y={qvisY}
				width={qvisSquare}
				height={qvisSquare}
				{idxs}
			/>
			<text x={qvisX} y={qvisY + 18 + qvisSquare} class="code"
				>idxs <tspan class="min">(closest codes)</tspan></text
			>
		{/if}

		{#if idxs}
			<text x={outPrismX} y={outPrismY + prismSquare + 18} class="code">
				<tspan x={outPrismX} dy="0"> quantized </tspan>
				<tspan x={outPrismX} dy="20" class="min"
					>(grab the entire embedding vector for each code)</tspan
				></text
			>
			<Features
				x={outPrismX}
				y={outPrismY}
				width={prismSquare}
				height={prismSquare}
				square={prismSmallerSquare}
				colorOverrides={grabColorsForOutFeatures(idxs)}
			/>
		{/if}

		<g id="decoder">
			<text
				x={decoderX + encoderWidth / 2}
				y={encoderOutY + prismSmallerSquare / 2}
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

		<text x={outputX} y={-7} class="code">reconstruction</text>
		<foreignObject
			id="output"
			x={outputX}
			y={0}
			width={inputOutputCanvasSize}
			height={inputOutputCanvasSize + 100}
		>
			<MnistDigit
				{...mnistStyle}
				data={outputDigit}
				square={inputOutputCanvasSize}
				maxVal={1}
			></MnistDigit>
		</foreignObject>

		<!-- <foreignObject
			x={inPrismX}
			y={inPrismY + prismSquare + 20}
			width={150}
			height={100}
		>
			<Button
				style="width: 150px;"
				color="dark"
				on:click={() => (expanded = !expanded)}
			>
				{#if expanded}
					Close
				{:else}
					Show Quantizing Process
				{/if}
			</Button>
		</foreignObject> -->
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
	.out {
		fill: hsla(39, 100%, 50%, 0.5);
		color: hsla(39, 100%, 50%, 0.5);
	}
	.min {
		fill: rgba(255, 255, 255, 0.5);
		color: rgba(255, 255, 255, 0.5);
	}
</style>
