<script lang="ts">
	import Hexagon from '$lib/shapes/Hexagon.svelte';

	let navHeight: number = 0;

	const navItems: { label: string, icon: string, href: string }[] = [
		{ label: 'Home', icon: 'fa-solid fa-house', href: '/' },
		{ label: 'About', icon: 'fa-solid fa-user', href: '/about' },
		{ label: 'Projects', icon: 'fa-solid fa-folder', href: '/projects' },
		{ label: 'Contact', icon: 'fa-solid fa-phone', href: '/contact' }	
	];
</script>

<div class="nav-wrapper" bind:clientHeight={navHeight} style="--nav-height: {navHeight}px">
	<nav>
		<ul>
			{#each navItems as item}
				<li><a class="hover-hex" href={item.href}><Hexagon class="hexagon-hover"><i class="{item.icon}" title="{item.label}"></i></Hexagon></a></li>
			{/each}
		</ul>
	</nav>
</div>

<style>
	.nav-wrapper {
		filter: drop-shadow(0rem 0rem 0.5rem rgba(0, 0, 0, 0.5));
	}

	/* .nav-wrapper {
        position: fixed;
		top: calc(-1 * var(--nav-height) + 0.75rem);
        transition: top 0.5s ease-in-out;
		transform: translateX(-50%);
    }

    .nav-wrapper:hover {
        top: 0;
    } */

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
		gap: 1rem;
		list-style: none;
		font-weight: bold;
		text-transform: uppercase;
		justify-content: center;
		text-align: center;
	}
</style>
