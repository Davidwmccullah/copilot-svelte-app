<script lang="ts">
	import { afterUpdate, onMount } from "svelte";
    import { toRadians } from "$lib/utils/math";
    import { formatTime } from "$lib/utils/format";
	import { Colors } from "$lib/ui/Colors";
    import Hexagon from "$lib/shapes/Hexagon.svelte";

    let playlist: string[] = [
        // "audio/K3NZH - Still 50 Cent.m4a",
        // "audio/Mechanicus OST.m4a",
        // "audio/Mehdibh - Sekiro.wav",
        // "audio/Darktide - Waiting to Strike + Imperial Strike.m4a",
        "audio/Crypto & Jake Daniels - Hayloft.mp3",
        "audio/TRAILS - DEAD.mp3"
    ]

    let visualizerWrapper: HTMLDivElement | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let canvasCtx: CanvasRenderingContext2D | null = null;
    let audio: HTMLAudioElement | null = null;
    let audioSrc: any = null;
    let analyser: AnalyserNode | null = null;
    let fftSizeExp: number = 10; // min is 5, max is 15
    let fftSize: number = Math.pow(2, fftSizeExp); // min is 32, max is 32768
    let dataArray: Uint8Array | null = null;
    let isPlaying: boolean = false;
    let animationFrameId: number = 0;
    let isInitialized: boolean = false;
    let currentTime: number = 0;
    let duration: number = 0;
    let volume: number = 0.5;
    let sliderLocked: boolean = false;
    let currentSongIndex: number = 0;
    let songTitle: string = 'No Song Selected';
    let numSides: number = 6;
    let filled = false;
    let mirrored = true;
    let fileInput: HTMLInputElement | null = null;
    let smoothStrength: number = .1;
    let logCutoff: number = 1;
    let sampleRate: number = 44100;

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

    let updateFFTSize = (): void => {
        if(!analyser) return;

        fftSize = Math.pow(2, fftSizeExp);
        
        analyser.fftSize = fftSize;

        const BUFFER_LEN = analyser.frequencyBinCount;

        dataArray = new Uint8Array(BUFFER_LEN);
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

    let initCustomAudio = (src: string): void => {
        if (!audio || !fileInput) return;

        let file: File | null = fileInput?.files?.[0] || null;

        if (isPlaying) {
            handlePlay();
        }

        audio.src = src;
        if (file) {
            songTitle = decodeURIComponent(file.name.split('.').slice(0, -1).join('.'));
        }
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

        sampleRate = audioCtx.sampleRate;

        audioSrc.connect(analyser);
        analyser.connect(audioCtx.destination);

        updateFFTSize();

        isInitialized = true;
    };

    let playVisualizer = (): void => {
        if (!canvas || !canvasCtx || !analyser || !dataArray) return;

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
      
        // let data: Uint8Array = dataArray;
        // Calculate the index range for each frequency band
        let bands = [
            {start: 20, end: 60},   // Sub-bass
            {start: 60, end: 250},  // Bass
            {start: 250, end: 500}, // Low Midrange
            {start: 500, end: 2000}, // Midrange
            {start: 2000, end: 4000}, // Upper Midrange
            {start: 4000, end: 6000}, // Presence
            {start: 6000, end: 20000} // Brilliance
        ].map(band => ({
            startIndex: Math.round(band.start * (fftSize / sampleRate)),
            endIndex: Math.round(band.end * (fftSize / sampleRate))
        }));

        // get an equal distribution of each set of bands and stitch the arrays together
        let selectedDataArray = new Uint8Array(bands.reduce((acc, band) => acc + (band.endIndex - band.startIndex), 0));

        let offset = 0;
        for (let band of bands) {
            for (let i = band.startIndex; i < band.endIndex; i++) {
                selectedDataArray[offset] = dataArray[i];
                offset++;
            }
        }

        let data: Uint8Array = lowessSmooth(new Uint8Array(selectedDataArray), smoothStrength);
            // let data: Uint8Array = dataArray.map((x) => {return 255});

        // drawRectangles(data);
        drawRegularPolygon(data);

        animationFrameId = requestAnimationFrame(function () {
            playVisualizer();
        });
    };

    let lowessSmooth = (dataArray: Uint8Array, bandwidth: number): Uint8Array => {
        let smoothedData = new Array(dataArray.length);

        // Apply the Lowess algorithm to each data point
        for (let i = 0; i < dataArray.length; i++) {
            let weights = new Array(dataArray.length).fill(0);
            let weightSum = 0;
            for (let j = 0; j < dataArray.length; j++) {
                let distance = Math.abs(i - j) / dataArray.length;
                if (distance <= bandwidth) {
                    let weight = Math.pow(1 - Math.pow(distance / bandwidth, 3), 3);
                    weights[j] = weight;
                    weightSum += weight;
                }
            }

            let sum = 0;
            for (let j = 0; j < dataArray.length; j++) {
                sum += dataArray[j] * weights[j];
            }
            smoothedData[i] = sum / weightSum;
        }

        // Convert the smoothed data to a Uint8Array
        let result = Uint8Array.from(smoothedData, x => Math.min(255, Math.max(0, Math.round(x))));

        return result;
    };

    let drawRectangles = (data: Uint8Array): void => {
        if (!canvas || !canvasCtx) return;

        let width = canvas.width;
        let height = canvas.height;
        let barWidth = width / data.length;

        canvasCtx.clearRect(0, 0, width, height);

        for (let i = 0; i < data.length; i++) {
            let value = data[i];
            let percent = value / 255;
            let barHeight = height * percent;

            let x = barWidth * i;
            let y = height - height * percent;

            canvasCtx.fillStyle = 'rgb(' + (percent * 255) + ', 50, 50)';

            canvasCtx.fillRect(x, y, barWidth, barHeight);
        }
    };

    let drawRegularPolygon = (data: Uint8Array): void => {
        if (!canvas || !canvasCtx) return;

        canvasCtx.lineWidth = 2;
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        if(!filled) {
            let radialGradient: CanvasGradient = canvasCtx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2
            );
            radialGradient.addColorStop(0, Colors["primary"]["600"]);
            radialGradient.addColorStop(1, Colors["surface"]["200"]);
            canvasCtx.strokeStyle = radialGradient;
        } else {
            let linearGradient: CanvasGradient = canvasCtx.createLinearGradient(
                0, 0, canvas.width, canvas.height
            );
            linearGradient.addColorStop(0, Colors["primary"]["600"]);
            linearGradient.addColorStop(1, Colors["surface"]["200"]);
            canvasCtx.fillStyle = linearGradient;
        }

        let radius: number = (Math.min(canvas.height, canvas.width) / 4) * (255 / data.reduce((a, b) => a + b, 0) / data.length);

        for(let side = 1; side <= numSides; side++) {
            for (let iteration = -1; iteration < (mirrored ? 2 : 0); iteration += 2) {
                if(!filled) {
                    canvasCtx.beginPath();
                }

                for (var i = 0; i < data.length; i++) {
                    let height: number = ((data[i]) / 255) * (Math.min((canvas.height / 2, canvas.width / 2)) - radius);
                    let rotation: number = (360 * ((i / (data.length - 1) * iteration) + side) / numSides);
                    let percent = data[i] / 255;

                    canvasCtx.save();

                    canvasCtx.translate(canvas.width / 2, canvas.height / 2);
                    canvasCtx.rotate(toRadians(rotation));

                    // if(!filled && !mirrored && i === 0) {
                    //     canvasCtx.lineTo(0, radius + (data[data.length - 1] / 255) * (Math.min(canvas.height, canvas.width) / 2 - radius) - canvasCtx.lineWidth);
                    // }

                    const percentage = 0.75;

                    let startColor = Colors.primary[100].replace('#', '');
                    let endColor = Colors.red[500].replace('#', '');

                    let startRGB = {
                        r: parseInt(startColor.slice(0, 2), 16),
                        g: parseInt(startColor.slice(2, 4), 16),
                        b: parseInt(startColor.slice(4, 6), 16)
                    };

                    let endRGB = {
                        r: parseInt(endColor.slice(0, 2), 16),
                        g: parseInt(endColor.slice(2, 4), 16),
                        b: parseInt(endColor.slice(4, 6), 16)
                    };

                    let interpolatedRGB = {
                        r: Math.round(startRGB.r + percent * (endRGB.r - startRGB.r)),
                        g: Math.round(startRGB.g + percent * (endRGB.g - startRGB.g)),
                        b: Math.round(startRGB.b + percent * (endRGB.b - startRGB.b))
                    };

                    canvasCtx.fillStyle = `rgb(${interpolatedRGB.r}, ${interpolatedRGB.g}, ${interpolatedRGB.b})`;

                    if (filled) {
                        canvasCtx.fillRect(-canvasCtx.lineWidth / 2, (radius - (height * percentage)) / percentage, canvasCtx.lineWidth, (height - (height * percentage)) / percentage);
                    } else {
                        canvasCtx.rotate(toRadians(180));
                        canvasCtx.lineTo(0, (radius + (height * percentage)) / percentage);
                    }

                    canvasCtx.restore();
                }
                
                if(!filled) {
                    canvasCtx.stroke();
                }
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
</script>

<div class="content-wrapper">
    {#if audio && audio.src}
        <div class="now-playing">{songTitle}</div>
    {/if}
    <div class="vis-wrapper" bind:this={visualizerWrapper}>
        <canvas bind:this={canvas} on:click={handlePlay}></canvas>
    </div>
    
    <audio bind:this={audio} on:timeupdate={updateSlider} bind:duration={duration} bind:volume={volume}></audio>

    {#if audio}
    <div class="controls">
        <div class="control-group">
            <button aria-label="Previous" on:click={() => {loopPlaylist(false);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-undo"></i>
                    </strong>
                </Hexagon>
            </button>
            <button aria-label="Rewind" on:click={() => {updateTime(-5);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-backward-step"></i>
                    </strong>
                </Hexagon>
            </button>
            <button aria-label="Pause/Play" on:click={handlePlay}>
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
            <button aria-label="Fast Forward" on:click={() => {updateTime(5);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-forward-step"></i>
                    </strong>
                </Hexagon>
            </button>
            <button aria-label="Next" on:click={() => {loopPlaylist(true);}}>
                <Hexagon class="hexagon-hover" minWidth="7rem">
                    <strong>
                        <i class="fas fa-redo"></i>
                    </strong>
                </Hexagon>
            </button>
        </div>

        <Hexagon class="gap">
            <span>{formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}</span>
            
            <div class="slider-wrapper">
                <input aria-label="Time Slider" type="range" min="0" max={duration} bind:value={currentTime} on:input={() => {updateTime(0);}} on:mousedown={lockSlider} on:mouseup={unlockSlider}/>
            </div>
        </Hexagon>
        
        <Hexagon class="gap">
            <button aria-label="Volume Toggle" on:click={handleVolumeIconClick}>
                {#if audio.muted}
                    <i class="fas fa-volume-mute"></i>
                {:else}
                    <i class="fas fa-volume-up"></i>
                {/if}
            </button>
            <div class="slider-wrapper">
                <input aria-label="Volume Slider" type="range" min="0" max="1" step="0.01" bind:value={volume} />
            </div>
        </Hexagon>

        <Hexagon class="gap">
            <button aria-label="Fill Toggle" on:click={() => {filled = !filled}}>
                {#if filled}
                    <i class="fas fa-star"></i>
                {:else}
                    <i class="far fa-star"></i>
                {/if}

            </button>
            <div class="slider-wrapper">
                <input aria-label="Side Slider" type="range" min="2" max="16" step="1" bind:value={numSides} />
            </div>
            <button aria-label="Duplicate Sides" on:click={() => {mirrored = !mirrored}}>
                {#if mirrored}
                    <i class="fas fa-circle"></i>
                {:else}
                    <i class="fas fa-circle-half-stroke"></i>
                {/if}
            </button>
        </Hexagon>

        <Hexagon class="gap">
            <div class="slider-wrapper">
                <input aria-label="FFT Size Slider" type="range" min="5" max="15" step="1" bind:value={fftSizeExp} on:input={(e) => {updateFFTSize()}}/>
            </div>
        </Hexagon>

        <Hexagon class="gap">
            <div class="slider-wrapper">
                <input aria-label="Smoothing Slider" type="range" min="0.01" max="0.1" step="0.01" bind:value={smoothStrength} />
            </div>
        </Hexagon>

        <button aria-label="File Selector" on:click={() => {fileInput && fileInput.click();}}>
            <Hexagon class="gap hexagon-hover">
                <input type="file" accept="audio/*" on:change={(e) => {if (e.target instanceof HTMLInputElement && e.target.files !== null) {initCustomAudio(URL.createObjectURL(e.target.files[0]));}}} bind:this={fileInput} style="display: none;" />
                <i class="fas fa-file-audio"></i>
            </Hexagon>
        </button>
    </div>
    {/if}
</div>

<style>
    .content-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        width: 100%;
        height: 100%;
    }
    .vis-wrapper {
        flex-direction: column;
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 100%;
        min-width: 16.5rem;
        min-height: 16.5rem;
        position: relative;
    }

    canvas {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
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
        clip-path: polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%);
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
        width: 100%;
        padding: 0;
        margin: 0;
    }

    i {
        height: 1.375rem;
        display: flex;
        align-items: center;
    }

    input[type="file"] {
        display: flex;
        background: var(--color-surface-200);
        padding: 0;
        max-height: 1rem;
        clip-path: polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%);
        transition: 0.3s all;
    }
</style>