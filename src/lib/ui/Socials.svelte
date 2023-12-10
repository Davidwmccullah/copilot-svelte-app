<!-- lib/ui/Navigation.svelte -->

<script>
	import Hexagon from '$lib/shapes/Hexagon.svelte';

	const navItems = [
		{ label: 'Youtube', href: 'https://www.youtube.com/' },
		{ label: 'Reddit', href: 'https://www.reddit.com/' },
		{ label: 'GitHub', href: 'https://www.github.com/' },
		{ label: 'Gmail', href: 'https://www.gmail.com/' }
	];
</script>

<div class="nav-wrapper">
	<nav>
		<ul>
			{#each navItems as item}
				<li><a class="hover-hex" target="_blank" href={item.href}><Hexagon className="hexagon-hover">{item.label}</Hexagon></a></li>
			{/each}
		</ul>
	</nav>
</div>


<style>
	.nav-wrapper {
        --nav-height: 4rem;
		filter: drop-shadow(0rem 0rem 0.5rem rgba(0, 0, 0, 0.5));
	}

	nav {
		gap: 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--color-surface-300);
		padding: 1rem 2rem;
		clip-path: polygon(2rem 0, calc(100% - 2rem) 0, 100% 100%, 0 100%);
	}

	nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
		list-style: none;
		font-weight: bold;
		text-transform: uppercase;
		justify-content: center;
		text-align: center;
	}
</style>
