import * as tf from "@tensorflow/tfjs";
import { loadEmbeddings, loadModels } from "./load";

/**
 * @param {tf.Tensor} a
 * @param {tf.Tensor} b
 */
export function tfDist(a, b) {
	const a_2 = tf.sum(tf.square(a), 1, true);
	const b_2 = tf.sum(tf.square(b), 0, true);
	const twoab = tf.mul(2, tf.matMul(a, b));
	return a_2.add(b_2).sub(twoab);
}

/**
 * @param {number[][]} a
 * @param {number[][]} b
 * @returns {number[][]}
 */
export function dist(a, b) {
	let og = [];
	for (let i = 0; i < a.length; ++i) {
		let res = [];
		for (let j = 0; j < b[0].length; ++j) {
			let summed = 0;
			for (let k = 0; k < a[0].length; ++k) {
				summed += (a[i][k] - b[k][j]) ** 2;
			}
			res.push(summed);
		}
		og.push(res);
	}
	return og;
}

/**
 * @param {number[][]} d
 * @returns {number[]}
 */
export function argmin(d) {
	let res = Array(d.length);
	for (let i = 0; i < d.length; ++i) {
		let min = Infinity;
		let minIndex = -1;
		for (let j = 0; j < d[0].length; ++j) {
			if (d[i][j] < min) {
				min = d[i][j];
				minIndex = j;
			}
		}
		res[i] = minIndex;
	}
	return res;
}

export class VectorQuantizer {
	/**
	 * @param {tf.Tensor} embeddings
	 */
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
		this.features = features;

		// quantization step
		const distances = tfDist(features, this.embeddings);
		this.distances = distances;
		const idxs = distances.argMin(1);
		this.idxs = idxs;

		const selectColumns = tf.oneHot(idxs, this.numEmbed);
		const quantized = tf.matMul(selectColumns, this.embeddings.transpose());

		return quantized.reshape(xShape);
	}
	dispose() {
		this.embeddings.dispose();
	}
}

export class VQVAE {
	/**
	 *
	 * @param {tf.GraphModel} encoder
	 * @param {tf.GraphModel} decoder
	 * @param {VectorQuantizer} vq
	 */
	constructor(encoder, decoder, vq) {
		this.encoder = encoder;
		this.decoder = decoder;
		this.vq = vq;
	}
	static async load() {
		const [encoder, decoder] = await loadModels();
		const embeddings = await loadEmbeddings();
		const vq = new VectorQuantizer(embeddings);
		return new VQVAE(encoder, decoder, vq);
	}
	/**
	 * @param {tf.Tensor} x
	 * @returns {tf.Tensor}
	 */
	predict(x) {
		const encoded = this.encoder.predict(x);
		const quantized = this.vq.predict(encoded);
		const decoded = this.decoder.predict(quantized);
		return decoded;
	}
	dispose() {
		this.decoder.dispose();
		this.encoder.dispose();
		this.vq.dispose();
	}
}
