<script>
	import { codeToHtml } from "shiki";
	import { onMount } from "svelte";

	export let linkedLines = [
		{ name: "embeddings", selection: [6, 11] },
		{ name: "features", selection: 12 },
		{ name: "fvecs", selection: 13 },
		{ name: "dists_idxs", selection: [14, 15] },
		{ name: "qvecs", selection: 16 },
		{ name: "quantized", selection: 17 },
	];

	export let height = "";
	export let width = "";
	export let lang = "python";
	export let code = `import tensorflow as tf
class VectorQuantizer(tf.keras.layers.Layer):
  def __init__(self, num_embed, embed_dim, beta=0.25, **kwargs):
      super().__init__(**kwargs)
      self.embed_dim, self.num_embed, self.beta = embed_dim, num_embed, beta
      self.embeddings = tf.Variable(
          initial_value=tf.random_uniform_initializer()(
              shape=(self.embed_dim, self.num_embed), dtype="float32"
          ),
          trainable=True
      )
  def call(self, features):
      fvecs = tf.reshape(features, (-1, self.embed_dim))
      dists = cdist(fvecs, self.embeddings)
      idxs = tf.argmin(dists, axis=-1)
      qvecs = select_columns(self.embeddings, idxs)
      quantized = tf.reshape(qvecs, tf.shape(features))
      # Losses and straight throw grad
      commitment_loss = tf.reduce_mean((tf.stop_gradient(quantized)-features)**2)
      codebook_loss = tf.reduce_mean((quantized-tf.stop_gradient(features))**2)
      quantized = features+tf.stop_gradient(quantized-features)
      return quantized, self.beta*commitment_loss + codebook_loss
def cdist(a, b): return tf.reduce_sum(a**2, axis=-1, keepdims=True) + tf.reduce_sum(b**2, axis=-2, keepdims=True) - 2*tf.matmul(a, b)
def select_columns(matrix, col_idxs): return tf.transpose(tf.gather(matrix, col_idxs, axis=-1))`;

	export let linkedCode = undefined;

	let html = "";
	let mounted = false;
	onMount(async () => {
		html = await codeToHtml(code, {
			lang,
			theme: "aurora-x",
		});
		el.innerHTML = html;
		const out = el.querySelector("pre");
		out.style.overflowX = "scroll";
		out.style.width = width;
		out.style.height = height;
		out.style.borderRadius = "3px";
		out.style.fontSize = "11px";
		out.style.padding = "10px";

		const lines = el.querySelectorAll(".line");
		for (const line of lines) {
			line.classList.add("not-focused");
			line.setAttribute("style", `float: left; width: 100%;`);
		}

		for (const linked of linkedLines) {
			if (Array.isArray(linked.selection)) {
				for (
					let i = linked.selection[0];
					i <= linked.selection[1];
					i++
				) {
					lines[i - 1].addEventListener("mouseenter", () => {
						linkedCode = linked.name;
					});
					lines[i - 1].classList.remove("not-focused");
				}
			} else {
				lines[linked.selection - 1].addEventListener(
					"mouseenter",
					() => {
						linkedCode = linked.name;
					}
				);
				lines[linked.selection - 1].classList.remove("not-focused");
			}
		}
		mounted = true;
	});

	function highlightLinked(name) {
		const l = linkedLines.find((d) => d.name === name);
		if (l) {
			if (Array.isArray(l.selection)) highlight(l.selection);
			else highlight([l.selection, l.selection]);
		}
	}

	function highlight(selection = [1, 5]) {
		const lines = el.querySelectorAll(".line");
		const a = lines[selection[0] - 1].getBoundingClientRect();
		const b = lines[selection[1] - 1].getBoundingClientRect();
		const relative = el.getBoundingClientRect();
		const startY = a.y - relative.y;
		highlightHeight = b.y - relative.y - startY + b.height;
		highlightStart = startY;
	}

	/** @type{HTMLDivElement}*/
	let el;
	let highlightHeight = 0;
	let highlightStart = 0;

	$: if (mounted) highlightLinked(linkedCode);
</script>

<div style="position: relative;">
	<div
		class="code"
		style="color: rgba(255,255,255,0.2); font-size: 12px; position: absolute; left: 0; top: -20px;"
	>
		Python
	</div>
	<div style="position: relative;" bind:this={el}>
		<!-- {@html html} -->
	</div>
	{#if highlightHeight !== 0 || highlightStart !== 0}
		<div
			style="position: absolute; width: {width}; height: {highlightHeight}px; left: 0; top: {highlightStart}px; outline: 1px dashed hsla(100, 0%, 65%, 0.5); background:hsla(100, 0%, 65%, 0.1); border-radius: 3px; transition: all 200ms ease-in-out; pointer-events: none;"
		>
			<!--  -->
		</div>
	{/if}
</div>

<style>
	:global(code) {
		counter-reset: step;
		counter-increment: step 0;
	}
	:global(code .line::before) {
		content: counter(step);
		counter-increment: step;
		width: 1rem;
		margin-right: 10px;
		display: inline-block;
		text-align: right;
		color: rgba(115, 138, 148, 0.4);
	}
	:global(.not-focused) {
		opacity: 0.3;
	}
</style>
