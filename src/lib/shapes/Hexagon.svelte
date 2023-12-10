<!-- lib/shapes/Hexagon.svelte -->

<script>
  import { onMount } from "svelte";

    export let className = '';
    export let minWidth = 'fit-content';
    let hexagonWrapper;
    let height = 0;

    onMount(() => {
        hexagonWrapper.style.setProperty('--clip-height', `${height / 3}px`);
    });
</script>

<div class="hexagon-wrapper {className}" bind:this={hexagonWrapper} bind:clientHeight={height}>
    <div class="hexagon" style="min-width: {minWidth}">
        <slot />
    </div>
</div>

<style>
    .hexagon-wrapper {
        width: fit-content;
        filter: drop-shadow(0rem 0rem 0.5rem var(--color-surfaceMixed-400));
        transition: all 0.3s;
    }

    .hexagon-hover {
        word-break: keep-all;
        filter: drop-shadow(0rem 0rem 0.5rem var(--color-primary-500));
    }

    .hexagon {
        color: var(--color-foreground-400);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 0.5rem 2rem;
        background: var(--color-surfaceMixed-400);
        transition: all 0.3s;
        clip-path: polygon(var(--clip-height) 0%, calc(100% - var(--clip-height)) 0%, 100% 50%, calc(100% - var(--clip-height)) 100%, var(--clip-height) 100%, 0% 50%);    }

    .hexagon-hover .hexagon {
        background: var(--color-primary-500);
        color: var(--color-surface-100);
    }

    .hexagon-hover:hover {
        filter: drop-shadow(0rem 0rem 0.5rem var(--color-surface-100));
    }

    .hexagon-hover:hover .hexagon {
        cursor: pointer;
        background: var(--color-surface-100);
        color: var(--color-primary-500);
        text-shadow: 0rem 0rem 0.5rem var(--color-primary-500);
    }
</style>
