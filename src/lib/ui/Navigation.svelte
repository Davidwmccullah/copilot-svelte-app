<!-- lib/ui/Navigation.svelte -->

<script>
	import Hexagon from '$lib/shapes/Hexagon.svelte';

	const navItems = [
		{ label: 'Home', href: '/' },
		{ label: 'About', href: '/about' },
		{ label: 'Projects', href: '/projects' },
		{ label: 'Contact', href: '/contact' }
	];
	
</script>

<div class="nav-wrapper">
	<nav>
		<!-- <a href="/" class="logo-link"><Hexagon className="hexagon-hover"><img src="logo.png" alt="Logo" /></Hexagon></a> -->
		<ul>
			{#each navItems as item}
				<li><a class="hover-hex" href={item.href}><Hexagon className="hexagon-hover">{item.label}</Hexagon></a></li>
			{/each}
		</ul>
	</nav>
</div>


<style>
	.nav-wrapper {
		filter: drop-shadow(0rem 0rem 0.5rem rgba(0, 0, 0, 0.5));
	}

	nav {
		gap: 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--color-surface-300);
		padding: 1rem 2rem;
		clip-path: polygon(0 0, 100% 0, calc(100% - 2rem) 100%, 2rem 100%);
	}
	
	nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		list-style: none;
		font-weight: bold;
		text-transform: uppercase;
		justify-content: center;
		text-align: center;
	}
</style>
