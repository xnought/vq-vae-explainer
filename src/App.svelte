<script>
	import "./app.css";
	import Header from "./lib/Header.svelte";
	import ImageSelector from "./lib/ImageSelector.svelte";
	import MnistDigit from "./lib/digit/MnistDigit.svelte";
	import Codebook from "./lib/Codebook.svelte";

	import { onDestroy, onMount } from "svelte";
	import { loadAllImages } from "./load";
	import * as tf from "@tensorflow/tfjs";
	import { VQVAE } from "./vectorQuantizer";
	import Features from "./lib/Features.svelte";

	const inputOutputCanvasSize = 300;
	const images = [1, 2, 3, 4, 5, 7].map((d) => `images/${d}.png`);
	let rawImages;
	let selectedImage = "images/1.png";

	// global model data
	let inputDigit = Array(784).fill(0);
	let outputDigit = Array(784).fill(0);
	let embeddings;
	let hovering;
	let idxs;

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

	function forward() {
		tf.tidy(() => {
			const input = tf
				.tensor(rawImages[selectedImage])
				.reshape([1, 28, 28, 1]);
			const recon = model.predict(input);

			outputDigit = recon.flatten().arraySync();
			idxs = model.vq.idxs.reshape([7, 7]).arraySync();
		});
	}

	$: if (rawImages) inputDigit = rawImages[selectedImage];
	$: if (model && selectedImage) forward();
</script>

<Header />
<main class="p-5">
	<div class="mb-2 flex gap-2 items-center">
		<ImageSelector imageUrls={images} bind:selectedUrl={selectedImage} />
	</div>
	<div class="flex gap-5" id="tool">
		<div>
			<MnistDigit
				data={inputDigit}
				square={inputOutputCanvasSize}
				maxVal={1}
			></MnistDigit>
		</div>
		<div>
			<Features
				width={200}
				height={200}
				square={125}
				mouseenter={(i, j) => (hovering = [i, j])}
				mouseleave={() => (hovering = undefined)}
			/>
		</div>
		<div>
			<Codebook
				width={200}
				height={100}
				{embeddings}
				hoveringColumn={idxs && hovering
					? idxs[hovering[0]][hovering[1]]
					: undefined}
			/>
		</div>
		<div>
			<MnistDigit
				data={outputDigit}
				square={inputOutputCanvasSize}
				maxVal={1}
			></MnistDigit>
		</div>
	</div>
</main>

<style></style>
