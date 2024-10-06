<script>
	export let imageUrls = [];
	export let selectedUrl;
	const width = 40;
</script>

<div class="flex gap-2">
	{#each imageUrls as src, i}
		<img
			{src}
			alt="begone yellow squigly lines"
			{width}
			class:lined={selectedUrl === src}
			on:click={() => {
				selectedUrl = src;
			}}
		/>
	{/each}
</div>

<style>
	.lined {
		opacity: 1;
		box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.5);
		outline: rgba(255, 255, 255, 0.3) 1px solid;
		border-radius: 1px;
	}
	.s {
		cursor: pointer;
	}
	img {
		cursor: pointer;
		opacity: 0.4;
	}
</style>
