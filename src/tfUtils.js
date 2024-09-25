import * as tf from "@tensorflow/tfjs";

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
