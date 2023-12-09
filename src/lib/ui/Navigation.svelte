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
		<a href="/" class="logo-link"><img src="logo.png" alt="Logo" /></a>
		<ul>
			{#each navItems as item}
				<li><Hexagon><a href={item.href}>{item.label}</a></Hexagon></li>
			{/each}
		</ul>
		<div class="spacer"></div>
	</nav>
</div>


<style>
	:root {
		--nav-height: 4rem;
	}

	.nav-wrapper {
		filter: drop-shadow(0rem 0rem 0.5rem rgba(0, 0, 0, 0.25));
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--color-surface-300);
		height: var(--nav-height);
		padding: 1rem calc(var(--nav-height));
		min-height: fit-content;
		clip-path: polygon(0 0, 100% 0, calc(100% - 2rem) 100%, 2rem 100%);
		
	}

	/* nav:before,
	nav:after {
		content: '';
		position: absolute;
		width: 0;
		height: 0;
		top: calc(var(--nav-height) * -1);
		border: var(--nav-height) solid transparent;
		filter: drop-shadow(0rem 0rem 0.5rem var(--color-surface-300));
	}

	nav:before {
		left: calc(var(--nav-height) * -1);
		border-right: calc(var(--nav-height) / 2) solid var(--color-surface-300);
	}

	nav:after {
		right: calc(var(--nav-height) * -1);
		border-left: calc(var(--nav-height) / 2) solid var(--color-surface-300);
	} */

	nav .logo-link {
		display: contents;
	}

	nav img {
		height: 100%;
		transition: all 0.3s;
	}

	nav img:hover {
		transform: scale(1.1);
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
		padding: 0rem 4rem;
	}

	.spacer {
		width: 2rem;
		height: 2rem;
	}
</style>
