import * as tf from "@tensorflow/tfjs";

const filepath = "tfjs";

export async function loadModels() {
	const encoder = await tf.loadGraphModel(`${filepath}/encoder/model.json`);
	const decoder = await tf.loadGraphModel(`${filepath}/decoder/model.json`);
	return [encoder, decoder];
}

/**
 * @param {string} txt
 */
function parseNumpyTxt(txt) {
	const rows = txt.split("\n");
	let result = [];
	for (let i = 0; i < rows.length - 1; ++i) {
		const r = rows[i].split(" ");
		const floats = r.map((d) => Number(d));
		result.push(floats);
	}
	return result;
}

export async function loadEmbeddings(name = "embeddings_dim16_num16.txt") {
	const out = await (await fetch(`${filepath}/${name}`)).text();
	const parsed = parseNumpyTxt(out);
	return tf.tensor(parsed);
}

export function loadImage(url) {
	const img = new Image();
	return new Promise((res, rej) => {
		img.src = url;
		img.onload = () => res(img);
		img.onerror = rej;
	});
}

export async function loadImageFull(url) {
	const img = await loadImage(url);
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	const d = ctx.getImageData(0, 0, img.width, img.height).data;
	img.remove();
	canvas.remove();
	return d;
}

function toGrey(d) {
	const result = new Uint8ClampedArray(d.length / 4);
	for (let i = 0, j = 0; i < d.length; i += 4, j++) {
		result[j] = d[i];
	}
	return result;
}

export async function loadAllImages(urls) {
	let result = {};
	for (let i = 0; i < urls.length; i++) {
		const url = urls[i];
		const d = await loadImageFull(url);
		const g = toGrey(d);
		const f32 = new Float32Array(g.length).map((_, i) => g[i] / 255);
		result[url] = f32;
	}
	return result;
}
