<script lang="ts">
    let message: string = "Hello, World!";
</script>

<div class="motd-wrapper">
    <p>{message}</p>
</div>

<style>
    .motd-wrapper {
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
