// worker.js

let sineTable = {};

function generateSineWave(frequency, duration, sampleRate) {
  const numSamples = sampleRate * duration;
  const wave = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    wave[i] = Math.sin(2 * Math.PI * frequency * t);
  }
  return wave;
}

function encodeMartin1(imgData, width, height, sampleRate) {
  let audioData = [];

  // Define the different tones
  const syncPulse = 1200;
  const burst = 1200;
  const black = 1500;
  const white = 2300;

  // Function to generate sine wave
  function generateSineWave(frequency, duration) {
    const numSamples = sampleRate * duration;
    const wave = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      wave[i] = Math.sin(2 * Math.PI * frequency * t);
    }
    return wave;
  }

  // Line sync pulse
  audioData = audioData.concat(Array.from(generateSineWave(syncPulse, 0.0045)));

  // Color burst
  audioData = audioData.concat(Array.from(generateSineWave(burst, 0.0057)));

  // Image data
  const totalPixels = width * height;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = imgData[y * width * 4 + x * 4];
      let g = imgData[y * width * 4 + x * 4 + 1];
      let b = imgData[y * width * 4 + x * 4 + 2];

      // Calculate grayscale value
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;

      // Map grayscale value to frequency
      let frequency = black + (white - black) * (gray / 255);

      // Generate audio data for the pixel
      audioData = audioData.concat(Array.from(generateSineWave(frequency, 0.000713)));

      // Update progress
      const progress = ((y * width + x) / totalPixels) * 100;
      postMessage({ type: 'progress', progress: progress });
    }
  }

  // Convert to Float32Array
  return new Float32Array(audioData);
}

onmessage = function(e) {
  switch (e.data.type) {
    case 'encode':
      const { imgData, width, height, encodingMode, sampleRate } = e.data;
      let audioData;

      switch (encodingMode) {
        case 'martin1':
          audioData = encodeMartin1(imgData, width, height, sampleRate);
          break;
        // ... other encoding modes ...
        default:
          audioData = new Float32Array([0]);
          break;
      }

      postMessage({ type: 'audioData', audioData: audioData });
      break;
  }
}
