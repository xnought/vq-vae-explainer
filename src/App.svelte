<script>
	import "./app.css";
	import Header from "./lib/Header.svelte";
	import ImageSelector from "./lib/ImageSelector.svelte";
	import MnistDigit from "./lib/digit/MnistDigit.svelte";
	import Codebook from "./lib/Codebook.svelte";
	import { Button, Spinner } from "flowbite-svelte";
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
	import SpanIdxs from "./lib/SpanIdxs.svelte";
	import LinkedCode from "./lib/LinkedCode.svelte";

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
	let linkedCode;

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
	$: qvisY = expanded ? featuresHeight + reshapeFeaturesY + 150 : inPrismY;

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

	$: linkedCodeRectPadding = 40;
	function pad(obj) {
		return {
			width: obj.width + linkedCodeRectPadding,
			height: obj.height + linkedCodeRectPadding,
			x: obj.x - linkedCodeRectPadding / 2,
			y: obj.y - linkedCodeRectPadding / 2,
		};
	}
	$: linkedCodeRects = {
		undefined: {
			width: 0,
			height: 0,
			x: 0,
			y: 0,
		},
		features: pad({
			width: prismSquare,
			height: prismSquare,
			x: inPrismX,
			y: inPrismY,
		}),
		fvecs: pad({
			width: featuresWidth,
			height: featuresHeight,
			x: reshapeFeaturesX,
			y: reshapeFeaturesY,
		}),
		embeddings: pad({
			width: codebookWidth,
			height: codebookHeight,
			x: codebookX,
			y: codebookY,
		}),
		dists_idxs: pad({
			width: codebookWidth,
			height: featuresHeight,
			x: pairwiseX,
			y: pairwiseY,
		}),
		qvecs: pad({
			width: featuresWidth,
			height: featuresHeight,
			x: quantizedX,
			y: quantizedY,
		}),
		quantized: pad({
			width: prismSquare,
			height: prismSquare,
			x: outPrismX,
			y: outPrismY,
		}),
	};
	$: if (expanded === false) linkedCode = undefined;
</script>

<Header />
<main class="p-5">
	{#if model && embeddings && rawImages}
		<div class="mb-2">
			<div class="mb-2 flex gap-1 out">
				<Pointer /> <b>Select</b> an <span class="code">input</span> or draw
				by dragging on the canvas
			</div>
			<ImageSelector
				imageUrls={images}
				bind:selectedUrl={selectedImage}
			/>
		</div>
		<svg style="margin-top: 40px;" height={900} width={1800}>
			{#if expanded}
				<foreignObject
					{...linkedCodeRects[linkedCode]}
					style="transition: all 200ms ease-in-out; "
				>
					<div
						style="background: rgba(115, 138, 148, 0.1); outline: 1px dashed  rgba(115, 138, 148, 0.4); width: {linkedCodeRects[
							linkedCode
						].width}px; height: {linkedCodeRects[linkedCode]
							.height}px; border-radius: 3px; transition: all 200ms ease-in-out;"
					></div>
				</foreignObject>
			{/if}
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
							>to map to <tspan class="qcode">quantized</tspan
							></tspan
						>
					</text>
					<Pointer y={8} />
				{/if}
			</svg>

			<Features
				mouseenter={() => (linkedCode = "features")}
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
			<foreignObject
				x={codebookX}
				y={codebookY}
				width={250}
				height={150}
				on:mouseenter={() => (linkedCode = "embeddings")}
			>
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
						x={inputX}
						y={inputOutputCanvasSize + 120}
						width={500}
						height={800}
					>
						<LinkedCode width="500px" bind:linkedCode />
						<div class="mt-2">
							<a
								target="_blank"
								href="https://colab.research.google.com/drive/1Dt6ngF_J50RUxfe7ZZYf-GBRORv7Husy?usp=sharing"
							>
								<img
									src="https://colab.research.google.com/assets/colab-badge.svg"
									alt="Open In Colab"
								/>
							</a>
						</div>
					</foreignObject>
					<foreignObject
						x={reshapeFeaturesX}
						y={reshapeFeaturesY +
							featuresHeight +
							linkedCodeRectPadding / 2}
						width={featuresWidth}
						height={200}
						class="code"
						style="font-size: 12px;"
					>
						<div>
							Reshape CNN features into rows of <span
								style="color: darkviolet;">fvecs</span
							>.
						</div>
					</foreignObject>
					<foreignObject
						x={reshapeFeaturesX}
						y={reshapeFeaturesY}
						width={featuresWidth}
						height={featuresHeight}
						on:mouseenter={() => (linkedCode = "fvecs")}
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

					<foreignObject
						x={pairwiseX}
						y={pairwiseY +
							featuresHeight +
							linkedCodeRectPadding / 2}
						class="code"
						style="font-size: 12px;"
						width={codebookWidth}
						height={200}
					>
						<div>
							Find distance (<span style="color: deeppink;"
								>dists</span
							>) from each row vector in
							<span style="color: darkviolet;">fvecs</span> to
							every column vector in
							<span class="qcode">embeddings</span>. Then pick the
							closest embedding as <SpanIdxs />
							<span class="min"
								>(the index of the closest codebook vector for
								each <span style="color: darkviolet;"
									>fvecs</span
								>)</span
							>.
						</div>
					</foreignObject>
					<foreignObject
						x={pairwiseX}
						y={pairwiseY}
						width={codebookWidth}
						height={featuresHeight}
						on:mouseenter={() => (linkedCode = "dists_idxs")}
					>
						{#if distances && argmin}
							<Pairwise
								style="outline: 2px solid deeppink;"
								{argmin}
								{distances}
								width={codebookWidth}
								height={featuresHeight}
								color="deeppink"
							/>
						{/if}
					</foreignObject>

					<foreignObject
						x={qvisX + qvisSquare + linkedCodeRectPadding / 2}
						y={qvisY}
						width={featuresWidth}
						height={200}
						class="code"
						style="font-size: 12px;"
					>
						<div>
							<SpanIdxs /> reshaped like features
							<span class="min">(for visualization purposes)</span
							>.
						</div>
					</foreignObject>

					<foreignObject
						x={quantizedX}
						y={quantizedY +
							featuresHeight +
							linkedCodeRectPadding / 2}
						width={featuresWidth}
						height={200}
						class="code"
						style="font-size: 12px;"
					>
						<div>
							Select full vectors from <span class="qcode"
								>embeddings</span
							>
							given each <SpanIdxs /> as
							<span style="color: deepskyblue">qvecs</span>.
						</div>
					</foreignObject>

					<foreignObject
						x={quantizedX}
						y={quantizedY}
						width={featuresWidth}
						height={featuresHeight}
						on:mouseenter={() => (linkedCode = "qvecs")}
					>
						{#if quantized}
							<SelectEmbed
								style="outline: deepskyblue 2px solid"
								{quantized}
								{argmin}
								width={featuresWidth}
								height={featuresHeight}
							/>
						{/if}
					</foreignObject>
					<foreignObject
						x={reshapeFeaturesX}
						y={reshapeFeaturesY + featuresHeight + 200}
						class="out"
						width={300}
						height={300}
					>
						<div class="flex gap-2">
							<Pointer width={40} height={40} />
							<span
								><b>Hover</b> over a<ArrowRightOutline
									style="display: inline; transform: rotate(-90deg)"
								/>matrix to highlight the corresponding line of<ArrowRightOutline
									style="display: inline; transform: rotate(180deg)"
								/>Python code.
							</span>
						</div>
					</foreignObject>
				</g>
			{/if}

			{#if idxs}
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
					mouseenter={() => (linkedCode = "quantized")}
					x={outPrismX}
					y={outPrismY}
					width={prismSquare}
					height={prismSquare}
					square={prismSmallerSquare}
					colorOverrides={grabColorsForOutFeatures(idxs)}
				/>
				<foreignObject
					x={outPrismX}
					y={outPrismY + prismSquare}
					width={prismSquare}
					height={300}
				>
					<div class="qcode">quantized</div>
					{#if expanded}
						<div class="code" style="font-size: 12px;">
							Reshape <span style="color: deepskyblue;"
								>qvecs</span
							> like the input features for the decoder.
						</div>
					{/if}
				</foreignObject>
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
							<Pointer width={40} height={40} /> Click here to reveal
							more Vector Quantization details
						</div>
					{/if}
				</Button>
			</foreignObject>
		</svg>
	{:else}
		<Spinner class="mr-2" />
		<span class="out">Loading the VQ-VAE Model and data...</span>
	{/if}
	<!-- <Button on:click={() => console.table(tf.memory())}>Memory</Button> -->
</main>

<style>
	svg,
	foreignObject {
		overflow: visible;
	}
</style>
