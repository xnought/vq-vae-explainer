<script>
	import { Button } from "flowbite-svelte";
	import { GithubSolid, FilePdfSolid } from "flowbite-svelte-icons";

	const color = "alternative";
</script>

<nav>
	<div id="inner">
		<div class="left">
			<img src="logo.svg" alt="logo" width="250" />
			<span
				id="title-desc"
				style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"
			>
				Interact with a <b>Vector Quantized Variational Autoencoder</b> right
				in your browser!
			</span>
		</div>
		<div class="right">
			<Button
				size="xs"
				href="https://github.com/xnought/vq-vae-explainer"
				target="_blank"
				{color}
				outline
				>Code
				<GithubSolid size="md" class="ml-1" />
			</Button>
			<!--
			<Button
				size="xs"
				href="https://arxiv.org/abs/2409.09011"
        target="_blank"
        {color}
        outline
				>Paper
				<FilePdfSolid size="md" class="ml-1" />
			</Button>
      -->
		</div>
	</div>
</nav>

<style>
	nav {
		background: black;
	}
	#inner {
		padding: 10px;
		padding-left: 15px;
		display: flex;
		justify-content: space-between;
		height: 60px;
	}
	.left {
		display: flex;
		gap: 20px;
		align-items: center;
	}
	.right {
		/* position: fixed;
		top: 10px;
		right: 10px; */
	}
	#title-desc {
		font-size: 20px;
		font-weight: 250;
	}
	b {
		font-weight: 700;
	}
	/* #github {
		cursor: pointer;
	} */
</style>
