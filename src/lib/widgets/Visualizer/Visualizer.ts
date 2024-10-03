import { toRadians } from "$lib/utils/math";
import { Colors } from "$lib/ui/Colors";

let playlist: string[] = [
    "audio/K3NZH - Still 50 Cent.m4a",
    // "audio/Mechanicus OST.m4a",
    "audio/Mehdibh - Sekiro.wav",
    // "audio/Darktide - Waiting to Strike + Imperial Strike.m4a",
    "audio/Crypto & Jake Daniels - Hayloft.wav",
    "audio/TRAILS - DEAD.mp3",
    "audio/Jake Daniels - Stalker.wav",
    "audio/Layto x Neoni - Ghost Town.wav",
    "audio/Neoni - WONDERLAND.wav",
]

export let visualizerWrapper: HTMLDivElement | null = null;
export let canvas: HTMLCanvasElement | null = null;
let canvasCtx: CanvasRenderingContext2D | null = null;
export let audio: HTMLAudioElement | null = null;
let audioSrc: any = null;
let analyser: AnalyserNode | null = null;
export let fftSizeExp: number = 12; // min is 5, max is 15
let fftSize: number = Math.pow(2, fftSizeExp); // min is 32, max is 32768
export let dataArray: Uint8Array | null = null;
export let isPlaying: boolean = false;
let animationFrameId: number = 0;
let isInitialized: boolean = false;
export let currentTime: number = 0;
export let duration: number = 0;
export let volume: number = 0.5;
let sliderLocked: boolean = false;
let currentSongIndex: number = 0;
export let songTitle: string = 'No Song Selected';
export let numSides: number = 6;
export let filled: boolean = true;
export let mirrored: boolean = true;
export let fileInput: HTMLInputElement | null = null;
export let smoothStrength: number = .1;
let sampleRate: number = 44100;
let bands: {startIndex: number, endIndex: number}[] = [];
let selectedDataArray: Uint8Array = new Uint8Array(0);
let rotationPosition: number = 0;
export let rotationSpeed: number = 0;
let indexCount: number = 0;

/**
 * Updates the time of the audio element
 * 
 * @param deltaTime - The time to add to the current time
 * @returns void
 */
export let updateTime = (deltaTime: number): void => {
    if(!audio) return;

    audio.currentTime = currentTime + deltaTime;
};

/**
 * Updates the slider value to match the current time of the audio element
 * 
 * @returns void
 */
export let updateSlider = (): void => {
    if(sliderLocked || !audio) return;
    
    currentTime = audio.currentTime;
};

/**
 * Updates the FFT size of the analyser node
 * 
 * @returns void
 */
export let updateFFTSize = (): void => {
    if(!analyser) return;

    fftSize = Math.pow(2, fftSizeExp);
    
    analyser.fftSize = fftSize;

    const BUFFER_LEN = analyser.frequencyBinCount;

    dataArray = new Uint8Array(BUFFER_LEN);

    bands = [
        // {start: 20, end: 60},   // Sub-bass
        {start: 20, end: 250},  // Sub-bass + Bass
        {start: 250, end: 500}, // Low Midrange
        {start: 500, end: 2000}, // Midrange
        {start: 2000, end: 4000}, // Upper Midrange
        {start: 4000, end: 6000}, // Presence
        {start: 6000, end: 20000} // Brilliance
    ].map(band => ({
        startIndex: Math.round(band.start * (fftSize / sampleRate)),
        endIndex: Math.round(band.end * (fftSize / sampleRate))
    }));
};

/**
 * Locks the slider to prevent the time from updating
 * 
 * @returns void
 */
export let lockSlider = (): void => {
    sliderLocked = true;
};

/**
 * Unlocks the slider to allow the time to update
 * 
 * @returns void
 */
export let unlockSlider = (): void => {
    sliderLocked = false;
};

/**
 * Resizes the canvas to fit the parent element
 * 
 * @returns void
 */
export let resizeCanvas = (): void => {
    if (!visualizerWrapper || !canvas) return;

    let minDimension: number = Math.min(visualizerWrapper.clientWidth, visualizerWrapper.clientHeight);
    canvas.style.width = minDimension.toString();
    canvas.style.height = minDimension.toString();
    canvas.width = minDimension;
    canvas.height = minDimension;
};

/**
 * Initializes the audio element with the first song in the playlist
 * 
 * @returns void
 */
export let initAudio = (): void => {
    if (!audio) return;

    shufflePlaylist(playlist);
    audio.src = playlist[0];
    setSongTitle(audio.src);
};

/**
 * Initializes the audio element with a custom audio file
 * 
 * @param src - The source of the audio file
 * @returns void
 */
export let initCustomAudio = (src: string): void => {
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

/**
 * Shuffles the playlist
 * 
 * @param playlist - The playlist to shuffle
 * @returns void
 */
let shufflePlaylist = (playlist: string[]): void => {
    for (let i = playlist.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));

        [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
    }
};

/**
 * Loops through the playlist
 * 
 * @param isForward - Whether to loop forward or backward
 * @returns void
 */
export let loopPlaylist = (isForward: boolean): void => {
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

/**
 * Sets the song title based on the source of the audio file
 * 
 * @param src - The source of the audio file
 * @returns void
 */
let setSongTitle = (src: string): void => {
    if (!src) return;

    let poppedSrc = src.split('/').pop();

    if(!poppedSrc) return;

    songTitle = decodeURIComponent(poppedSrc.split('.').slice(0, -1).join('.'))
};

/**
 * Initializes the visualizer
 * 
 * @returns void
 */
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

/**
 * Plays the visualizer
 * 
 * @returns void
 */
let playVisualizer = (): void => {
    if (!canvas || !canvasCtx || !analyser || !dataArray) return;

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);

    indexCount = bands[0].endIndex - bands[0].startIndex;
    selectedDataArray = new Uint8Array(indexCount * bands.length);

    for (let i = 0; i < bands.length; i++) {
        let band = bands[i];
        let bandData = dataArray.slice(band.startIndex, band.endIndex);
        let bandAverage = bandData.reduce((a, b) => a + b, 0) / bandData.length;

        for (let j = 0; j < indexCount; j++) {
            selectedDataArray[i * indexCount + j] = bandData[j];
        }
    }


    let data: Uint8Array = lowessSmooth(new Uint8Array(selectedDataArray), smoothStrength);
    // let fullDataArray: Uint8Array = selectedDataArray.map((x) => {return 255});

    // drawRectangles(data);
    // drawRegularPolygon(data);
    drawHexagon(data);
    rotationPosition += rotationSpeed;

    animationFrameId = requestAnimationFrame(function () {
        playVisualizer();
    });
};

/**
 * Applies the Lowess smoothing algorithm to the data
 * 
 * @param dataArray - The data to smooth
 * @param bandwidth - The bandwidth of the smoothing
 * @returns The smoothed data
 */
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

/**
 * Draws rectangles based on the data
 * 
 * @param data - The data to draw rectangles for
 * @returns void
 */
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

        // color the bars based on their bands set, use a different color for each set
        let bandIndex = Math.floor(i / (data.length / bands.length));
        switch (bandIndex) {
            case 0:
                canvasCtx.fillStyle = Colors.teal[1800];
                break;
            case 1:
                canvasCtx.fillStyle = Colors.teal[1600];
                break;
            case 2:
                canvasCtx.fillStyle = Colors.teal[1400];
                break;
            case 3:
                canvasCtx.fillStyle = Colors.teal[1200];
                break;
            case 4:
                canvasCtx.fillStyle = Colors.teal[1000];
                break;
            case 5:
                canvasCtx.fillStyle = Colors.teal[800];
                break;
            case 6:
                canvasCtx.fillStyle = Colors.teal[600];
                break;
            default:
                canvasCtx.fillStyle = Colors.grey[500];
                break;
        }


        canvasCtx.fillRect(x, y, barWidth, barHeight);
    }
};

/**
 * Gets the color for the strength of the value
 * 
 * @param value - The value to get the color for
 * @param bandIndex - The index of the band
 * @returns The color for the strength of the value
 */
let getColorForStrength = (value: number, bandIndex: number): string => {
    let percent = value / 255;
    let startColor = Colors.teal[600].replace('#', '');
    let endColor = Colors.teal[1800].replace('#', '');

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

    interpolatedRGB.r += bandIndex * 10;
    interpolatedRGB.g += bandIndex * 10;
    interpolatedRGB.b += bandIndex * 10;

    return `rgb(${interpolatedRGB.r}, ${interpolatedRGB.g}, ${interpolatedRGB.b})`;
};

/**
 * Gets the rainbow color for the strength of the value
 * 
 * @param value - The value to get the color for
 * @param bandIndex - The index of the band
 * @returns The color for the strength of the value
 */
let getRainbowColorForStrength = (value: number, bandIndex: number): string => {
    let percent = value / 255;
    let color: string;
    switch (bandIndex % 7) {
        case 0:
            color = `rgb(255, 0, 0)`; // Red
            break;
        case 1:
            color = `rgb(255, 165, 0)`; // Orange
            break;
        case 2:
            color = `rgb(255, 255, 0)`; // Yellow
            break;
        case 3:
            color = `rgb(0, 255, 0)`; // Green
            break;
        case 4:
            color = `rgb(0, 0, 255)`; // Blue
            break;
        case 5:
            color = `rgb(75, 0, 130)`; // Indigo
            break;
        case 6:
            color = `rgb(238, 130, 238)`; // Violet
            break;
        default:
            color = `rgb(0, 0, 0)`; // Black (fallback)
            break;
    }
    return color;
};

/**
 * Draws a regular polygon based on the data
 * 
 * @param data - The data to draw the polygon for
 * @returns void
 */
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

            for (var i = 0; i < indexCount; i++) {
                let height: number = ((data[i]) / 255) * (Math.min((canvas.height / 2, canvas.width / 2)) - radius)
                let rotation: number = (360 * ((i / (data.length - 1) * iteration) + side) / numSides);
                let percent = data[i] / 255;

                canvasCtx.save();

                canvasCtx.translate(canvas.width / 2, canvas.height / 2);
                canvasCtx.rotate(toRadians(rotation));
                canvasCtx.rotate(toRadians(rotationPosition * iteration));


                // if(!filled && !mirrored && i === 0) {
                //     canvasCtx.lineTo(0, radius + (data[data.length - 1] / 255) * (Math.min(canvas.height, canvas.width) / 2 - radius) - canvasCtx.lineWidth);
                // }

                const percentage = 0.75;

                let bandIndex = Math.floor(i / (data.length / bands.length));

                canvasCtx.fillStyle = getRainbowColorForStrength(data[i], bandIndex);

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

/**
 * Draws a hexagon based on the data
 * 
 * @param data - The data to draw the hexagon for
 * @returns void
 */
let drawHexagon = (data: Uint8Array): void => {
    if (!canvas || !canvasCtx) return;

    canvasCtx.lineWidth = 2;
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const percentage = 0.75;

    let radius: number = (Math.min(canvas.height, canvas.width) / 4) * (255 / data.reduce((a, b) => a + b, 0) / data.length);

    // for each set of bands, draw a side, this will determine the number of sides of the polygon. The sides should converge in a regular polygon with a number of sides equal to the number of band groups
    for(let side = 1; side <= bands.length; side++) {
        // for (let iteration = -1; iteration < (mirrored ? 2 : 0); iteration += 2) {
            canvasCtx.beginPath();
            let rotationAngle: number = 30;
            let gap = (canvas.width / indexCount);
            canvasCtx.rotate(toRadians(rotationAngle));
            for (var i = (side - 1) * indexCount; i < side * indexCount; i++) {
                let height: number = ((data[i]) / 255) * (Math.min((canvas.height / 2, canvas.width / 2)) - radius);
                let bandIndex = Math.floor(i / (data.length / bands.length));
                canvasCtx.fillStyle = getRainbowColorForStrength(data[i], bandIndex);

                canvasCtx.save();

                canvasCtx.translate(canvas.width / 2, canvas.height / 2);

                canvasCtx.fillRect(canvasCtx.lineWidth * i + gap, 0, canvasCtx.lineWidth, (height - (height * percentage)) / percentage);

                // (360 * ((i / (data.length - 1) * iteration) + side) / numSides);

                // canvasCtx.rotate(toRadians(rotationPosition));

                // if (filled) {
                // } else {
                //     canvasCtx.rotate(toRadians(180));
                //     canvasCtx.lineTo(0, (radius + (height * percentage)) / percentage);
                // }

                canvasCtx.restore();
            }

            canvasCtx.stroke();
        // }
    }
};

/**
 * Handles the play/pause button click
 * 
 * @returns void
 */
export let handlePlay = (): void => {
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

/**
 * Handles the volume icon click
 * 
 * @returns void
 */
export let handleVolumeIconClick = (): void => {
    if (!audio) return;
    
    audio.muted = !audio.muted;
};