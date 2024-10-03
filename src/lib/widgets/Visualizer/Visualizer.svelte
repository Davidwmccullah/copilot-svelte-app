<svelte:head>
    <link rel="stylesheet" href="/css/Visualizer.css">
</svelte:head>

<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import * as Visualizer from "./Visualizer";
    import { formatTime } from "$lib/utils/format";
    import Hexagon from "$lib/shapes/Hexagon.svelte";

    let audio: HTMLAudioElement | null = null;
    let visualizerWrapper: HTMLElement | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let duration: number = 0;
    let volume: number = 0;
    let filled: boolean = false;
    let mirrored: boolean = false;
    let fileInput: HTMLInputElement | null = null;

    /**
     * Resizes the canvas to fit the parent element
     * 
     * @returns void
     */
    onMount(() => {
        audio = Visualizer.audio;
        visualizerWrapper = Visualizer.visualizerWrapper;
        canvas = Visualizer.canvas;
        duration = Visualizer.duration;
        volume = Visualizer.volume;
        filled = Visualizer.filled;
        mirrored = Visualizer.mirrored;
        fileInput = Visualizer.fileInput;

        Visualizer.initAudio();
        Visualizer.resizeCanvas();
    });

    /**
     * Resizes the canvas to fit the parent element
     * 
     * @returns void
     */
    afterUpdate((): void => {
        Visualizer.resizeCanvas();
    });
</script>

<div class="content-wrapper">
    {#if audio && audio.src}
        <div class="now-playing">{Visualizer.songTitle}</div>
    {/if}
    <div class="vis-wrapper" bind:this={visualizerWrapper}>
        <canvas bind:this={canvas} on:click={Visualizer.handlePlay}></canvas>
    </div>
    
    <audio bind:this={audio} on:timeupdate={Visualizer.updateSlider} bind:duration={duration} bind:volume={volume}></audio>

    {#if audio}items
    <div class="controls">
        <div class="control-group">
            <button aria-label="Previous" on:click={() => {Visualizer.loopPlaylist(false);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-undo"></i>
                    </strong>
                </Hexagon>
            </button>
            <button aria-label="Rewind" on:click={() => {Visualizer.updateTime(-5);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-backward-step"></i>
                    </strong>
                </Hexagon>
            </button>
            <button aria-label="Pause/Play" on:click={Visualizer.handlePlay}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        {#if Visualizer.isPlaying}
                            <i class="fas fa-pause"></i>
                        {:else}
                            <i class="fas fa-play"></i>
                        {/if}
                    </strong>
                </Hexagon>
            </button>
            <button aria-label="Fast Forward" on:click={() => {Visualizer.updateTime(5);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-forward-step"></i>
                    </strong>
                </Hexagon>
            </button>
            <button aria-label="Next" on:click={() => {Visualizer.loopPlaylist(true);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-redo"></i>
                    </strong>
                </Hexagon>
            </button>
        </div>

        <div class="control-group">
            <Hexagon class="gap">
                <span title="Current Time">{formatTime(Visualizer.currentTime)}&nbsp;/&nbsp;{formatTime(Visualizer.duration)}</span>
                
                <div class="slider-wrapper"></div>
                <input aria-label="Time Slider" type="range" min="0" max={Visualizer.duration} bind:value={Visualizer.currentTime} on:input={() => {Visualizer.updateTime(0);}} on:mousedown={Visualizer.lockSlider} on:mouseup={Visualizer.unlockSlider}/>
            </Hexagon>
            
            <Hexagon class="gap">
                <button aria-label="Volume Toggle" title="Toggle Volume" on:click={Visualizer.handleVolumeIconClick}>
                    {#if audio.muted}
                    <i class="fas fa-volume-mute" title="Muted"></i>
                    {:else}
                    <i class="fas fa-volume-up" title="Unmuted"></i>
                    {/if}
                </button>
                <div class="slider-wrapper">
                    <input aria-label="Volume Slider" type="range" min="0" max="1" step="0.01" bind:value={Visualizer.volume} />
                </div>
            </Hexagon>

            <Hexagon class="gap">
                <button aria-label="Fill Toggle" title="Toggle Fill" on:click={() => {filled = !filled}}>
                    {#if Visualizer.filled}
                    <i class="fas fa-star" title="Filled"></i>
                    {:else}
                    <i class="far fa-star" title="Not Filled"></i>
                    {/if}
                </button>
                <div class="slider-wrapper">
                    <input aria-label="Side Slider" type="range" min="2" max="16" step="1" bind:value={Visualizer.numSides} />
                </div>
                <button aria-label="Duplicate Sides" title="Toggle Mirrored" on:click={() => {mirrored = !mirrored}}>
                    {#if Visualizer.mirrored}
                    <i class="fas fa-circle" title="Mirrored"></i>
                    {:else}
                    <i class="fas fa-circle-half-stroke" title="Not Mirrored"></i>
                    {/if}
                </button>
            </Hexagon>

            <Hexagon class="gap">
                <i class="fas fa-chart-bar" title="FFT Size"></i>
                <div class="slider-wrapper">
                    <input aria-label="FFT Size Slider" type="range" min="5" max="15" step="1" bind:value={Visualizer.fftSizeExp} on:input={(e) => {Visualizer.updateFFTSize()}}/>
                </div>
            </Hexagon>

            <Hexagon class="gap">
                <i class="fas fa-chart-line" title="Smoothing"></i>
                <div class="slider-wrapper"></div>
                <input aria-label="Smoothing Slider" type="range" min="0.01" max="0.1" step="0.01" bind:value={Visualizer.smoothStrength} />
            </Hexagon>

            <Hexagon class="gap">
                <i class="fas fa-sync" title="Rotation Speed"></i>
                <div class="slider-wrapper"></div>
                <input aria-label="Rotation Speed Slider" type="range" min="-1" max="1" step="0.01" bind:value={Visualizer.rotationSpeed} />
            </Hexagon>
        </div>

        <div class="control-group">
            <button aria-label="File Selector" on:click={() => {fileInput && fileInput.click();}}>
                <Hexagon class="gap hexagon-hover">
                    <input type="file" accept="audio/*" on:change={(e) => {if (e.target instanceof HTMLInputElement && e.target.files !== null) {Visualizer.initCustomAudio(URL.createObjectURL(e.target.files[0]));}}} bind:this={fileInput} style="display: none;" />
                    <i class="fas fa-file-audio"></i>
                </Hexagon>
            </button>
        </div>
    </div>
    {/if}
</div>