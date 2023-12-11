<script lang="ts">
    import { getapi } from "$lib/utils/api.ts";
  import { onMount } from "svelte";

    let message: string = "";

    let api_url: string = "https://api.example.com";

    onMount((): void => {
        getapi(api_url).then((res: any) => {
            message = res;
        });
    });
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
