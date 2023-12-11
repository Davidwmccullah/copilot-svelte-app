<script>
	import Navigation from '$lib/ui/Navigation.svelte';
	import Socials from '$lib/ui/Socials.svelte';
	import { Colors } from '$lib/ui/Colors';
	import { onMount } from 'svelte';

	onMount(() => {
		for(let colorType in Colors) {
			for(let colorNumber in Colors[colorType]) {
				document.documentElement.style.setProperty(`--color-${colorType}-${colorNumber}`, Colors[colorType][colorNumber]);
			}
		}
	});
</script>

<header>
	<Navigation />
</header>

<main>
	<slot />
</main>

<footer>
	<Socials />
</footer>

<style>
	:global(*) {
		box-sizing: border-box;
		padding: 0;
		margin: 0;
	}

	:global(:root) {
		color: var(--color-foreground-600);
		background: var(--color-surface-100);
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	:global(html, body) {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		background-repeat: no-repeat;
		background-size: cover;
        overflow-x: hidden;
	}

	:global(a) {
		color: var(--color-primary-600);
		text-decoration: none;
		transition: all 0.3s;
	}

	:global(a:hover) {
		color: var(--color-primary-600);
		text-shadow: 0rem 0rem 0.5rem var(--color-primary-600);
		transition: all 0.3s;
	}

	:global(main ul, main ol) {
		padding-left: 2em;
	}

	:global(button) {
		padding: 0;
		border: none;
		font: inherit;
		color: inherit;
		background-color: transparent;
		cursor: pointer;
	}

	:global(i, i::before) {
		display: flex;
		justify-content: center;
		align-content: center;
		text-align: center;
		align-items: center;
	}

	:global(i) {
		aspect-ratio: 1;
	}

	:global(strong) {
		flex-wrap: nowrap;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
	}

    footer, header {
		vertical-align: bottom;
		align-self: center;
		width: fit-content;
        position: sticky;
		z-index: 1;
    }
	
	header {
		top: 0
	}

	footer {
		bottom: 0;
	}

	main {
		/* max-height: 100%; */
        display: flex;
		padding: 1rem;
		flex: 1;
		justify-content: center;
	}
</style>
