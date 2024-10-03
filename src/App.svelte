<script>
	import "./app.css";
	import Header from "./lib/Header.svelte";
	import ImageSelector from "./lib/ImageSelector.svelte";
	import MnistDigit from "./lib/digit/MnistDigit.svelte";
	import Codebook from "./lib/Codebook.svelte";
	import { Button } from "flowbite-svelte";
	import { TrashBinOutline, ArrowRightOutline } from "flowbite-svelte-icons";

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
	import TSpanIdxs from "./lib/TSpanIdxs.svelte";

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
			const input = tf
				.tensor(d)
				.reshape([1, 28, 28, 1])
				.transpose([0, 2, 1, 3]);
			const recon = model.predict(input);

			inputDigit = d;
			outputDigit = recon.transpose([0, 2, 1, 3]).flatten().arraySync();
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

	// $: if (model && selectedImage) forward(rawImages[selectedImage]);
	let featuresWidth = 150;
	let featuresHeight = 300;
	let codebookWidth = 250;
	let codebookHeight = 150;
	let prismSquare = 150;
	let prismSmallerSquare = 100;
	let expanded = false;
	let qvisSquare = 150;

	// svg positioning
	$: inputX = 0;
	$: inputEncoderGap = 10;
	$: largerGap = 3 * inputEncoderGap;

	$: encoderX = inputX + inputOutputCanvasSize + inputEncoderGap;
	$: encoderInHeight = inputOutputCanvasSize;
	$: encoderOutHeight = prismSquare;
	$: encoderWidth = 100;
	$: encoderOutX = encoderX + encoderWidth;
	$: encoderOutY = inputOutputCanvasSize - 75;

	$: inPrismX = encoderOutX + inputEncoderGap;
	$: inPrismY = encoderOutY;

	$: reshapeFeaturesX = inPrismX + prismSquare + largerGap;
	$: reshapeFeaturesY = inPrismY;

	$: codebookX = expanded
		? reshapeFeaturesX + featuresWidth + largerGap
		: inPrismX + prismSquare + inputEncoderGap;
	$: codebookY = 25;

	$: pairwiseX = codebookX;
	$: pairwiseY = reshapeFeaturesY;

	$: quantizedX = pairwiseX + codebookWidth + largerGap;
	$: quantizedY = reshapeFeaturesY;

	$: outPrismX = expanded
		? quantizedX + featuresWidth + largerGap
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

	function updateSelectedImage(selectedImage) {
		forward(rawImages[selectedImage]);
	}

	$: if (model && rawImages) updateSelectedImage(selectedImage);

	let updateCounter = 0;
	function updateDraw(d, skip = 5) {
		inputDigit = d;
		if (updateCounter % skip === 0) {
			forward(d);
		}
		updateCounter++;
	}
</script>

<Header />
<main class="p-5">
	<div class="mb-2">
		<div class="mb-2 flex gap-1 out">
			<Pointer /> <b>Select</b> an <span class="code">input</span> or draw
			by dragging on the canvas
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
				onChange={updateDraw}
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
			{#if !expanded}
				<text x={25 + 5} y={25} class="out">
					<tspan x={25 + 5} dy="0">
						<tspan style="font-weight: 600;">Hover</tspan>
						<tspan class="code">features</tspan></tspan
					>
					<tspan x={25 + 5} dy="15"
						>to map to <tspan class="qcode">quantized</tspan></tspan
					>
				</text>
				<Pointer y={8} />
			{/if}
		</svg>
		<Features
			x={inPrismX}
			y={inPrismY}
			width={prismSquare}
			height={prismSquare}
			square={prismSmallerSquare}
		/>

		<foreignObject
			x={codebookX - 125}
			y={codebookY + 100}
			width={100}
			height={50}
			class="code min"
			style="font-size: 11px;"
		>
			<div class="flex items-center">
				<span>
					continuous <span class="code">features</span> snap to
					<span class="qcode">discrete codes</span>
				</span>
				<ArrowRightOutline
					color="rgba(255,255,255,0.2)"
					style="transform: rotate(-45deg) scale(2);"
				/>
			</div>
		</foreignObject>

		<text x={codebookX} y={codebookY - 7} class="qcode"
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
				<text
					x={reshapeFeaturesX}
					y={reshapeFeaturesY + featuresHeight}
					class="code"
					style="font-size: 12px;"
				>
					<tspan dy="15" x={reshapeFeaturesX}
						><tspan style="fill: darkviolet;">fvecs</tspan> = tf.reshape(</tspan
					>
					<tspan dy="15" x={reshapeFeaturesX + 20}>features,</tspan>
					<tspan dy="15" x={reshapeFeaturesX + 20}
						>(-1, embed_dim)</tspan
					>
					<tspan dy="15" x={reshapeFeaturesX}>)</tspan>
				</text>
				<foreignObject
					x={reshapeFeaturesX}
					y={reshapeFeaturesY}
					width={featuresWidth}
					height={featuresHeight}
				>
					{#if features}
						<FeaturesReshape
							style="outline: 2px solid darkviolet;"
							color="darkviolet"
							{features}
							width={featuresWidth}
							height={featuresHeight}
						/>
					{/if}
				</foreignObject>

				<text
					x={pairwiseX}
					y={pairwiseY + featuresHeight}
					class="code"
					style="font-size: 12px;"
				>
					<tspan dy="15" x={pairwiseX}
						><tspan style="fill: crimson;">dists</tspan> = cdist(<tspan
							style="fill: darkviolet;">fvecs</tspan
						>, <tspan class="qcode">embeddings</tspan>)</tspan
					>
					<tspan dy="15" x={pairwiseX}
						><TSpanIdxs /> = tf.argmin(<tspan style="fill: crimson;"
							>dists</tspan
						>, -1)</tspan
					>
				</text>
				<foreignObject
					x={pairwiseX}
					y={pairwiseY}
					width={codebookWidth}
					height={featuresHeight}
				>
					{#if distances && argmin}
						<Pairwise
							style="outline: 2px solid crimson;"
							{argmin}
							{distances}
							width={codebookWidth}
							height={featuresHeight}
							color="crimson"
						/>
					{/if}
				</foreignObject>

				<text
					x={quantizedX}
					y={quantizedY + featuresHeight}
					class="code"
					style="font-size: 12px;"
				>
					<tspan dy="15" x={quantizedX}
						><tspan fill="yellow">qvecs</tspan> = select_embed(</tspan
					>
					<tspan dy="15" x={quantizedX + 20}><TSpanIdxs />,</tspan>
					<tspan dy="15" x={quantizedX + 20} class="qcode"
						>embeddings</tspan
					>
					<tspan dy="15" x={quantizedX}>)</tspan>
				</text>
				<foreignObject
					x={quantizedX}
					y={quantizedY}
					width={featuresWidth}
					height={featuresHeight}
				>
					{#if quantized}
						<SelectEmbed
							style="outline: yellow 2px solid"
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
				><TSpanIdxs />
				{" "}<tspan class="qcode min">(closest codes)</tspan></text
			>
		{/if}

		{#if idxs}
			<Features
				x={outPrismX}
				y={outPrismY}
				width={prismSquare}
				height={prismSquare}
				square={prismSmallerSquare}
				colorOverrides={grabColorsForOutFeatures(idxs)}
			/>
			<text x={outPrismX} y={outPrismY + prismSquare + 18} class="qcode">
				quantized
			</text>
			{#if expanded}
				{@const offsetX = outPrismX + 70}
				<text
					x={offsetX}
					y={outPrismY + prismSquare + 3}
					class="code"
					style="font-size: 12px;"
				>
					<tspan dy="15" x={offsetX}> = tf.reshape(</tspan>
					<tspan dy="15" x={offsetX + 20}
						><tspan fill="yellow">qvecs</tspan>,</tspan
					>
					<tspan dy="15" x={offsetX + 20}>features.shape</tspan>
					<tspan dy="15" x={offsetX}>)</tspan>
				</text>
			{/if}
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

		<foreignObject
			x={codebookX + codebookWidth + 15}
			y={codebookY + 110}
			width={100}
			height={50}
			class="code min"
			style="font-size: 11px;"
		>
			<div class="flex items-center gap-2">
				<ArrowRightOutline
					color="rgba(255,255,255,0.2)"
					style="transform: rotate(45deg) scale(2);"
				/>
				<span>
					grab embedding representation for each selected <span
						class="qcode">code</span
					>
				</span>
			</div>
		</foreignObject>

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

		<foreignObject
			x={codebookX}
			y={codebookY - 125}
			width={300}
			height={100}
		>
			<Button
				style="width: 250px;"
				color="dark"
				on:click={() => (expanded = !expanded)}
			>
				{#if expanded}
					Close
				{:else}
					<div class="flex gap-2">
						<Pointer width={40} height={40} /> Click here to reveal more
						Vector Quantization details
					</div>
				{/if}
			</Button>
		</foreignObject>
	</svg>
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
