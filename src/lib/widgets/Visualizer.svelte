<script>
	import { afterUpdate, onMount } from "svelte";
    import { toRadians } from "$lib/utils/math";
    import { formatTime } from "$lib/utils/format";
	import { Colors } from "$lib/ui/Colors";
    import Hexagon from "$lib/shapes/Hexagon.svelte";

    let visualizerWrapper;
    let canvas;
    let canvasCtx;
    let audio;
    let audioSrc;
    let analyser;
    let fftSize = 512;
    let dataArray;
    let isPlaying = false;
    let animationFrameId;
    let isInitialized = false;
    let currentTime = 0;
    let duration = 0;
    let volume = 0.5;
    let sliderLocked = false;

    onMount(() => {
        initAudio();
        resizeCanvas();
    });

    afterUpdate(() => {
        resizeCanvas();
    });

    let updateTime = () => {
        audio.currentTime = currentTime;
    };

    let updateSlider = () => {
        if(!sliderLocked)
            currentTime = audio.currentTime;
    };

    let lockSlider = () => {
        sliderLocked = true;
    };

    let unlockSlider = () => {
        sliderLocked = false;
    };

    let resizeCanvas = () => {
        let minDimension = Math.min(visualizerWrapper.clientWidth, visualizerWrapper.clientHeight);
        canvas.width = minDimension;
        canvas.height = minDimension;
    };

    let initAudio = () => {
        audio.src = "K3NZH - Still 50 Cent.mp4";
    };

    let initVisualizer = () => {
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

    let playVisualizer = () => {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);

        let data = smooth_data(dataArray, 10);
        data = sample(data, 64);
        drawRectangles(data);

        animationFrameId = requestAnimationFrame(function () {
            playVisualizer();
        });
    };

    let drawRectangles = (data) => {
        let width = 2;
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        let gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, Colors["primary"]["600"]);
        gradient.addColorStop(0.5, Colors["surface"]["200"]);

        for (var i = 0; i < data.length; i++) {
            var radius = (Math.min(canvas.height, canvas.width) / 2) * (data.reduce((a, b) => a + b, 0) / data.length / 255);

            var height = (data[i] / 255) * (Math.min(canvas.height, canvas.width) / 2 - radius) - canvasCtx.lineWidth;
            var rotation = 180 * i / (data.length - 1);

            
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

    let handlePlay = () => {1
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

    let handleVolumeIconClick = () => {
        audio.muted = !audio.muted;
    };

    function smooth_data(data, strength) {
        const smoothedData = [];
        const length = data.length;

        for (let i = 0; i < length; i++) {
            let sum = data[i];
            let count = 1;

            const num_neighbors = Math.floor(strength / 2);
            const startIndex = Math.max(0, i - num_neighbors);
            const endIndex = Math.min(length - 1, i + num_neighbors);

            for (let j = startIndex; j <= endIndex; j++) {
                if (j !== i) { // Skip the current index since we already added it to the sum
                    sum += data[j];
                    count++;
                }
            }

            const average = sum / count;
            smoothedData.push(average);
        }

        return smoothedData;
    }

    function sample(data, n) {
        const result = [];

        for (let i = 0; i < n; i++) {
            const index = Math.floor(i * data.length / n);
            result.push(data[index]);
        }

        return result;
    }
</script>

<div class="vis-wrapper" bind:this={visualizerWrapper}>
    {#if audio && audio.src}
        <div class="now-playing">{decodeURIComponent(audio.src.split('/').pop().split('.').slice(0, -1).join('.'))}</div>
    {/if}
    <canvas bind:this={canvas} on:click={handlePlay}></canvas>
    <audio bind:this={audio} on:timeupdate={updateSlider} bind:duration={duration} bind:volume={volume}></audio>

    {#if audio}
    <div class="controls">
        <div class="control-group">
            <div on:click={handlePlay}>
                <Hexagon className="hexagon-hover" minWidth="7rem">
                    <span>
                    {#if isPlaying}
                        Pause
                    {:else}
                        Play
                    {/if}
                    </span>
                </Hexagon>
            </div>
        </div>

        <Hexagon>
            <span>{formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}</span>
            
            <div class="slider-wrapper">
                <input type="range" min="0" max={duration} bind:value={currentTime} on:input={updateTime} on:mousedown={lockSlider} on:mouseup={unlockSlider}/>
            </div>
        </Hexagon>
        
        <Hexagon>
            {#if audio.muted}
                <i class="fas fa-volume-mute" on:click={handleVolumeIconClick}></i>
            {:else}
                <i class="fas fa-volume-up" on:click={handleVolumeIconClick}></i>
            {/if}
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
    }
    
    canvas {
        max-width: 100%;
    }

    .controls {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
    }

    span {
        font-weight: bold;
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