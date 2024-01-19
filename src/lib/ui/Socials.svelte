<script lang="ts">
	import Hexagon from '$lib/shapes/Hexagon.svelte';

	const navItems: { label: string, icon: string, href: string }[] = [
		{ label: 'Youtube', icon: 'fab fa-youtube', href: 'https://www.youtube.com/' },
		{ label: 'Reddit', icon: 'fab fa-reddit-alien', href: 'https://www.reddit.com/' },
		{ label: 'GitHub', icon: 'fab fa-github', href: 'https://www.github.com/' },
		{ label: 'Gmail', icon: 'fa-solid fa-envelope', href: 'https://www.gmail.com/' }
	];
</script>

<div class="nav-wrapper">
	<nav>
		<ul>
			{#each navItems as item}
				<li><a aria-label={item.label} class="hover-hex" target="_blank" href={item.href}><Hexagon class="hexagon-hover"><i class="{item.icon}"></i></Hexagon></a></li>
			{/each}
		</ul>
	</nav>
</div>

<style>
	.nav-wrapper {
        --nav-height: 4rem;
		filter: drop-shadow(0rem 0rem 0.5rem rgba(0, 0, 0, 0.5));
	}

	/* .nav-wrapper {
        position: fixed;
		bottom: calc(-1 * var(--nav-height) + 0.75rem);
        transition: bottom 0.5s ease-in-out;
		transform: translateX(-50%);
    }

    .nav-wrapper:hover {
        bottom: 0;
    } */

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
		gap: 1rem;
		list-style: none;
		font-weight: bold;
		text-transform: uppercase;
		justify-content: center;
		text-align: center;
	}
</style>
