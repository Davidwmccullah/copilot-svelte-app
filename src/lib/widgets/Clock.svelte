<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    let currentTime: Date = new Date();

    let updateTime = (): void => {
        currentTime = new Date();
    };

    let interval: number = 0;

    onMount((): void => {
        interval = setInterval(updateTime, 1000);
    });

    onDestroy((): void => {
        clearInterval(interval);
    });
</script>

<div class="clock-wrapper">
    <h1>{currentTime.toLocaleTimeString()}</h1>
</div>

<style>
    .clock-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-content: center;
        color: var(--color-primary-300);
        text-shadow: 0rem 0rem 0.25rem var(--color-primary-300);
    }
</style>
