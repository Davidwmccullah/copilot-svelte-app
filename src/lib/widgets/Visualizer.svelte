<script lang="ts">
	import { afterUpdate, onMount } from "svelte";
    import { toRadians } from "$lib/utils/math";
    import { formatTime } from "$lib/utils/format";
	import { Colors } from "$lib/ui/Colors";
    import Hexagon from "$lib/shapes/Hexagon.svelte";

    let playlist: string[] = [
        "audio/K3NZH - Still 50 Cent.m4a",
        "audio/Mechanicus OST.m4a",
        "audio/Mehdibh - Sekiro.wav",
    ]

    let visualizerWrapper: HTMLDivElement | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let canvasCtx: CanvasRenderingContext2D | null = null;
    let audio: HTMLAudioElement | null = null;
    let audioSrc: MediaElementAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;
    let fftSize: number = 512;
    let dataArray: Uint8Array | null = null;
    let isPlaying: boolean = false;
    let animationFrameId: number = 0;
    let isInitialized: boolean = false;
    let currentTime: number = 0;
    let duration: number = 0;
    let volume: number = 0.5;
    let sliderLocked: boolean = false;
    let currentSongIndex: number = 0;
    let songTitle: string = '';

    onMount((): void => {
        initAudio();
        resizeCanvas();
    });

    afterUpdate((): void => {
        resizeCanvas();
    });

    let updateTime = (deltaTime: number): void => {
        if(!audio) return;

        audio.currentTime = currentTime + deltaTime;
    };

    let updateSlider = (): void => {
        if(sliderLocked || !audio) return;
        
        currentTime = audio.currentTime;
    };

    let lockSlider = (): void => {
        sliderLocked = true;
    };

    let unlockSlider = (): void => {
        sliderLocked = false;
    };

    let resizeCanvas = (): void => {
        if (!visualizerWrapper || !canvas) return;

        let minDimension: number = Math.min(visualizerWrapper.clientWidth, visualizerWrapper.clientHeight);
        canvas.style.width = minDimension.toString();
        canvas.style.height = minDimension.toString();
        canvas.width = minDimension;
        canvas.height = minDimension;
    };

    let initAudio = (): void => {
        if (!audio) return;

        shufflePlaylist(playlist);
        audio.src = playlist[0];
        setSongTitle(audio.src);
    };

    let shufflePlaylist = (playlist: string[]): void => {
        for (let i = playlist.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));

            [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
        }
    };

    let loopPlaylist = (isForward: boolean): void => {
        if (!audio) return;

        handlePlay();

        if (isForward) {
            currentSongIndex++;
            if (currentSongIndex >= playlist.length) {
                currentSongIndex = 0;
            }
        } else {
            currentSongIndex--;
            if (currentSongIndex < 0) {
                currentSongIndex = playlist.length - 1;
            }
        }

        audio.src = playlist[currentSongIndex];

        setSongTitle(audio.src);

        handlePlay();
    };

    let setSongTitle = (src: string): void => {
        if (!src) return;

        let poppedSrc = src.split('/').pop();

        if(!poppedSrc) return;

        songTitle = decodeURIComponent(poppedSrc.split('.').slice(0, -1).join('.'))
    };

    let initVisualizer = (): void => {
        if (!canvas || !audio) return;

        canvasCtx = canvas.getContext("2d");

        let audioCtx = new AudioContext();

        audioSrc = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();

        audioSrc.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = fftSize;

        const BUFFER_LEN = analyser.frequencyBinCount;

        dataArray = new Uint8Array(BUFFER_LEN);

        isInitialized = true;
    };

    let playVisualizer = (): void => {
        if (!canvas || !canvasCtx || !analyser || !dataArray) return;

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);

        let data: Uint8Array = smooth_data(dataArray, 10);
        data = sample(data, 64);

        drawRectangles(data);

        animationFrameId = requestAnimationFrame(function () {
            playVisualizer();
        });
    };

    let drawRectangles = (data: Uint8Array): void => {
        if (!canvas || !canvasCtx) return;

        let width: number = 2;
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        let gradient: CanvasGradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, Colors["primary"]["600"]);
        gradient.addColorStop(0.5, Colors["surface"]["200"]);

        for (var i = 0; i < data.length; i++) {
            let radius: number = (Math.min(canvas.height, canvas.width) / 2) * (data.reduce((a, b) => a + b, 0) / data.length / 255);

            let height: number = (data[i] / 255) * (Math.min(canvas.height, canvas.width) / 2 - radius) - canvasCtx.lineWidth;
            let rotation: number = 180 * i / (data.length - 1);

            
            for (let iteration = 0; iteration < 2; iteration++) {
                canvasCtx.save();

                canvasCtx.translate(canvas.width / 2, canvas.height / 2);
                canvasCtx.rotate(toRadians(rotation + (180 * iteration)));

                canvasCtx.fillStyle = gradient;                
                canvasCtx.fillRect(-width / 2, radius, width, height);

                canvasCtx.restore();
            }
        }
    }

    let handlePlay = (): void => {
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            cancelAnimationFrame(animationFrameId);
        } else {
            if (!isInitialized) {
                initVisualizer();
            }

            audio.play();
            isPlaying = true;
            playVisualizer();

            audio.onended = () => {
                isPlaying = false;
                cancelAnimationFrame(animationFrameId);
            };
        }
    };

    let handleVolumeIconClick = (): void => {
        if (!audio) return;
        
        audio.muted = !audio.muted;
    };

    let smooth_data = (data: Uint8Array, strength: number): Uint8Array => {
        if(!data || !strength) return(data);

        if (strength < 1) {
            return data;
        }

        if (strength > data.length) {
            strength = data.length;
        }

        let smoothedData: number[] = [];
        let length: number = data.length;

        for (let i = 0; i < length; i++) {
            let sum: number = data[i];
            let count: number = 1;

            let num_neighbors: number = Math.floor(strength / 2);
            let startIndex: number = Math.max(0, i - num_neighbors);
            let endIndex: number = Math.min(length - 1, i + num_neighbors);

            for (let j = startIndex; j <= endIndex; j++) {
                if (j !== i) { // Skip the current index since we already added it to the sum
                    sum += data[j];
                    count++;
                }
            }

            let average: number = sum / count;
            smoothedData.push(average);
        }

        return Uint8Array.from(smoothedData);
    }

    let sample = (data: Uint8Array, n: number): Uint8Array => {
        let result: number[] = [];

        for (let i = 0; i < n; i++) {
            let index: number = Math.floor(i * data.length / n);
            result.push(data[index]);
        }

        return Uint8Array.from(result);
    }
</script>

<div class="vis-wrapper" bind:this={visualizerWrapper}>
    {#if audio && audio.src}
        <div class="now-playing">{songTitle}</div>
    {/if}
    <canvas bind:this={canvas} on:click={handlePlay}></canvas>
    <audio bind:this={audio} on:timeupdate={updateSlider} bind:duration={duration} bind:volume={volume}></audio>

    {#if audio}
    <div class="controls">
        <div class="control-group">
            <button on:click={() => {loopPlaylist(false);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-undo"></i>
                    </strong>
                </Hexagon>
            </button>
            <button on:click={() => {updateTime(-5);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-backward-step"></i>
                    </strong>
                </Hexagon>
            </button>
            <button on:click={handlePlay}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        {#if isPlaying}
                            <i class="fas fa-pause"></i>
                        {:else}
                            <i class="fas fa-play"></i>
                        {/if}
                    </strong>
                </Hexagon>
            </button>
            <button on:click={() => {updateTime(5);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-forward-step"></i>
                    </strong>
                </Hexagon>
            </button>
            <button on:click={() => {loopPlaylist(true);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-redo"></i>
                    </strong>
                </Hexagon>
            </button>
        </div>

        <Hexagon>
            <span>{formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}</span>
            
            <div class="slider-wrapper">
                <input type="range" min="0" max={duration} bind:value={currentTime} on:input={() => {updateTime(0);}} on:mousedown={lockSlider} on:mouseup={unlockSlider}/>
            </div>
        </Hexagon>
        
        <Hexagon>
            <button on:click={handleVolumeIconClick}>
                {#if audio.muted}
                    <i class="fas fa-volume-mute"></i>
                {:else}
                    <i class="fas fa-volume-up"></i>
                {/if}
            </button>
            <div class="slider-wrapper">
                <input type="range" min="0" max="1" step="0.01" bind:value={volume} />
            </div>
        </Hexagon>
    </div>
    {/if}
    
</div>

<style>
    .vis-wrapper {
        flex-direction: column;
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    canvas {
        max-width: 512px;
        max-height: 512px;
    }

    .controls {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
        flex-direction: column;
        align-items: center;
    }

    .control-group {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
    }
    
    .slider-wrapper {
        filter: drop-shadow(0rem 0rem 0.5rem var(--color-surface-200));
    }

    input[type="range"] {
        display: flex;
        background: var(--color-surface-200);
        padding: 0;
        max-height: 1rem;
        clip-path: polygon(5% 0%, calc(100% - 5%) 0%, 100% 50%, calc(100% - 5%) 100%, 5% 100%, 0% 50%);
        transition: 0.3s all;
    }

    input[type="range"]::-webkit-slider-thumb,
    input[type="range"]::-moz-range-thumb {
        clip-path: polygon(0% 50%, 25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%);
        -webkit-appearance: none;
        width: 1.25rem;
        height: 1.25rem;
        appearance: none;
        background: radial-gradient(circle at center, var(--color-surface-200) 0%, var(--color-primary-200) 50%);
        cursor: pointer;
        border: none;
        border-radius: 0;
        transition: 0.3s all;
    }

    .now-playing {
        color: var(--color-primary-300);
        text-shadow: 0rem 0rem 0.25rem var(--color-primary-300);
        font-weight: bold;
        text-align: center;
    }

    i {
        height: 1.375rem;
        display: flex;
        align-items: center;
    }
</style>