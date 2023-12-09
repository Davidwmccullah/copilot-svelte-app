<!-- src/routes/+layout.svelte -->
<script>
	import Navigation from '$lib/ui/Navigation.svelte';
	import Socials from '$lib/ui/Socials.svelte';
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
		--color-primary-100: #008170;
		--color-primary-200: #358f7f;
		--color-primary-300: #539d8e;
		--color-primary-400: #6daa9d;
		--color-primary-500: #86b8ad;
		--color-primary-600: #9ec6bd;

		--color-surface-100: #232d3f;
		--color-surface-200: #384152;
		--color-surface-300: #4f5666;
		--color-surface-400: #666c7a;
		--color-surface-500: #7e838f;
		--color-surface-600: #969aa4;

		--color-surface-mixed-100: #243544;
		--color-surface-mixed-200: #3a4957;
		--color-surface-mixed-300: #505d6a;
		--color-surface-mixed-400: #67727e;
		--color-surface-mixed-500: #7f8892;
		--color-surface-mixed-600: #979fa7;

		--color-foreground-100: #ffffff;
		--color-foreground-200: #f2f2f2;
		--color-foreground-300: #e5e5e5;
		--color-foreground-400: #d9d9d9;
		--color-foreground-500: #cccccc;
		--color-foreground-600: #bfbfbf;

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

	:global(a:hover, a:focus) {
		color: var(--color-primary-600);
		text-shadow: 0rem 0rem 0.5rem var(--color-primary-600);
		transition: all 0.3s;
	}

	:global(main ul, main ol) {
		padding-left: 2em;
	}

    header {
        position: sticky;
        top: 0;
    }

	main {
        display: flex;
		padding: 1rem;
		flex: 1;
	}
</style>
