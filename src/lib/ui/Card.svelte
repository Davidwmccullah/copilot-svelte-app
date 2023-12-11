<script lang="ts">
	import Hexagon from '$lib/shapes/Hexagon.svelte';

	export let title: string = '';
</script>

<div class="card-wrapper" style={$$props.style}>
	<div class="card">
		{#if title}
		<Hexagon>
			<h2>{title}</h2>
		</Hexagon>
		{/if}

		<div class="content">
			<slot />
		</div>
	</div>
</div>

<style>
	.card-wrapper {
		display: flex;
		justify-content: center;
		filter: drop-shadow(0rem 0rem 0.5rem rgba(0, 0, 0, 0.25));
	}

	.card {
		--corner-width: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		width: 100%;
		max-width: 100%;
		background: var(--color-surface-200);
		padding: calc(1 * var(--corner-width));
		clip-path: polygon(
			var(--corner-width) 0,
			calc(100% - var(--corner-width)) 0,
			100% var(--corner-width),
			100% calc(100% - var(--corner-width)),
			calc(100% - var(--corner-width)) 100%,
			var(--corner-width) 100%,
			0 calc(100% - var(--corner-width)),
			0 var(--corner-width)
		);
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		gap: 1rem;
		padding: 1rem;
	}
</style>
