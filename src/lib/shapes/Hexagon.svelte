<script lang="ts">
  let height: number = 0;
</script>

<div
  class="hexagon-wrapper {$$props.class}"
  bind:clientHeight={height}
  style="--clip-height: {height / 3}px"
>
  <div class="hexagon" style={$$props.style}>
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
    padding: 0.5rem 1rem;
    background: var(--color-surfaceMixed-400);
    transition: all 0.3s;
    clip-path: polygon(
      var(--clip-height) 0%,
      calc(100% - var(--clip-height)) 0%,
      100% 50%,
      calc(100% - var(--clip-height)) 100%,
      var(--clip-height) 100%,
      0% 50%
    );
  }

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

  .warn:hover {
    filter: drop-shadow(0rem 0rem 0.5rem var(--color-red-500));
  }

  .warn:hover .hexagon {
    color: var(--color-foreground-100);
    background: var(--color-red-500);
  }

  .gap {
    gap: 1rem;
  }
</style>
