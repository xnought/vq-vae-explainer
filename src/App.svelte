<script>
	import "./app.css";
	import Header from "./lib/Header.svelte";
	import ImageSelector from "./lib/ImageSelector.svelte";

	import { onDestroy, onMount } from "svelte";
	import { loadEmbeddings, loadModels } from "./load";
	import * as tf from "@tensorflow/tfjs";
	import * as tfu from "./tfUtils";

	class VectorQuantizer {
		constructor(embeddings) {
			this.embeddings = embeddings;
			this.numEmbed = this.embeddings.shape[1];
			this.embedDim = this.embeddings.shape[0];
		}
		/**
		 * @param {tf.Tensor} x
		 */
		predict(x) {
			const xShape = x.shape;
			const features = x.reshape([-1, this.embedDim]);

			// quantization step
			const idxs = tfu.tfDist(features, this.embeddings).argMin(1);
			const selectColumns = tf.oneHot(idxs, this.numEmbed);
			const quantized = tf.matMul(
				selectColumns,
				this.embeddings.transpose()
			);

			return quantized.reshape(xShape);
		}
	}

	const images = [1, 2, 3, 4, 5, 7].map((d) => `images/${d}.png`);
	let rawImages;
	let selectedImage = "images/1.png";

	$: console.log(selectedImage);

	onMount(async () => {
		const embeddings = await loadEmbeddings();
		tf.tidy(() => {
			const tensorEmbeddings = tf.tensor(embeddings);
			const vq = new VectorQuantizer(tensorEmbeddings);
		});

		// tf.tidy(() => {
		// 	loadModels().then(([encoder, decoder]) => {
		// 		const input = tf.ones([1, 28, 28, 1]);
		// 		const out = encoder.predict(input);

		// 		const decInput = tf.ones([1, 7, 7, 16]);
		// 		const decOut = decoder.predict(decInput);

		// 	});
		// });
	});
</script>

<Header />
<main class="p-5">
	<div class="mb-2 flex gap-2 items-center">
		<ImageSelector imageUrls={images} bind:selectedUrl={selectedImage} />
	</div>
</main>

<style></style>
