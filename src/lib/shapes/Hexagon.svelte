<!-- lib/shapes/Hexagon.svelte -->

<script>
    import { afterUpdate } from 'svelte';

    let hexagon;
    let height;

    afterUpdate(() => {
        hexagon.style.setProperty("--height", `${height/2}px`);
    });

    function handleClick(event) {
        const target = event.target;
        const anchor = target.querySelector('a');

        if (anchor) {
            anchor.click();
        }
    }
</script>

<a class="hexagon-wrapper" on:click={handleClick} href="">
    <div class="hexagon" bind:this={hexagon} bind:clientHeight={height}>
        <slot>
            
        </slot>
    </div>
</a>


<style>
    .hexagon-wrapper {
        filter: drop-shadow(0rem 0rem 0.5rem var(--color-primary-500));
        transition: all 0.3s;
    }

    .hexagon-wrapper:hover {
        filter: drop-shadow(0rem 0rem 0.5rem var(--color-surface-100));
    }

    .hexagon {
        display: block;
        padding: 0.5rem 1rem;
        background: var(--color-primary-500);
        transition: all 0.3s;
        box-shadow: 0rem 0rem 0.5rem var(--color-primary-500);
        clip-path: polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%);
    }

    .hexagon:hover {
        cursor: pointer;
        background: var(--color-surface-100);
        box-shadow: 0rem 0rem 0.5rem var(--color-surface-100);
    }

    :global(.hexagon a) {
        display: block;
        color: var(--color-surface-100);
        text-shadow: 0rem 0rem 0.5rem rgba(0, 0, 0, 0.25);
        line-height: 1rem;
    }

    :global(.hexagon:hover a) {
        color: var(--color-primary-500);
        text-shadow: 0rem 0rem 0.5rem var(--color-primary-500);
    }
</style>