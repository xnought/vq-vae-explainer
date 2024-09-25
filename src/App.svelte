<script>
	import "./app.css";
	import Header from "./lib/Header.svelte";
	import ImageSelector from "./lib/ImageSelector.svelte";
	import MnistDigit from "./lib/digit/MnistDigit.svelte";

	import { onDestroy, onMount } from "svelte";
	import { loadAllImages } from "./load";
	import * as tf from "@tensorflow/tfjs";
	import { VQVAE } from "./vectorQuantizer";

	const inputOutputCanvasSize = 300;
	const images = [1, 2, 3, 4, 5, 7].map((d) => `images/${d}.png`);
	let rawImages;
	let selectedImage = "images/1.png";
	let inputDigit = Array(784).fill(0);
	let outputDigit = Array(784).fill(0);

	/** @type {VQVAE}*/
	let model;

	onMount(async () => {
		rawImages = await loadAllImages(images);
		rawImages["clear"] = new Float32Array(784).fill(0);
		model = await VQVAE.load();
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
		loadAllImages
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
