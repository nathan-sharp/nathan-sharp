// sstv.js

document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('image-input');
  const encodingModeSelect = document.getElementById('encoding-mode');
  const encodeButton = document.getElementById('encode-button');
  const audioOutput = document.getElementById('audio-output');
  const encodingProgress = document.getElementById('encoding-progress');

  let audioContext;

  // Function to initialize AudioContext
  function getAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  }

  encodeButton.addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (!file) {
      alert('Please select an image file.');
      return;
    }

    const mode = encodingModeSelect.value;
    encodingProgress.textContent = `Encoding image using ${mode} mode...`;
    audioOutput.style.display = 'none'; // Hide audio player during encoding

    try {
      const imageData = await loadImage(file);
      const audioBuffer = await generateSSTVAudio(imageData, mode);

      // Play the generated audio
      const source = getAudioContext().createBufferSource();
      source.buffer = audioBuffer;
      source.connect(getAudioContext().destination);
      source.start();

      // Provide a downloadable link for the audio
      const wavBlob = audioBufferToWav(audioBuffer, getAudioContext().sampleRate);
      const url = URL.createObjectURL(wavBlob);
      audioOutput.src = url;
      audioOutput.style.display = 'block';

      encodingProgress.textContent = 'Encoding complete!';

    } catch (error) {
      console.error('SSTV Encoding Error:', error);
      encodingProgress.textContent = `Error: ${error.message}`;
      alert('Failed to encode image. Check console for details.');
    }
  });

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(ctx.getImageData(0, 0, img.width, img.height));
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Helper to convert AudioBuffer to WAV Blob (for download/playback in <audio> tag)
  function audioBufferToWav(buffer, sampleRate) {
    const numOfChan = buffer.numberOfChannels;
    const bytesPerSample = 2; // 16-bit PCM
    const blockAlign = numOfChan * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;

    const bufferArray = new ArrayBuffer(44 + dataSize);
    const view = new DataView(bufferArray);

    let offset = 0;

    /* RIFF identifier */
    writeString(view, offset, 'RIFF'); offset += 4;
    /* file length */
    view.setUint32(offset, 36 + dataSize, true); offset += 4;
    /* RIFF type */
    writeString(view, offset, 'WAVE'); offset += 4;
    /* format chunk identifier */
    writeString(view, offset, 'fmt '); offset += 4;
    /* format chunk length */
    view.setUint32(offset, 16, true); offset += 4;
    /* sample format (raw) */
    view.setUint16(offset, 1, true); offset += 2;
    /* channel count */
    view.setUint16(offset, numOfChan, true); offset += 2;
    /* sample rate */
    view.setUint32(offset, sampleRate, true); offset += 4;
    /* byte rate (sample rate * block align) */
    view.setUint32(offset, byteRate, true); offset += 4;
    /* block align (channel count * bytes per sample) */
    view.setUint16(offset, blockAlign, true); offset += 2;
    /* bits per sample */
    view.setUint16(offset, 16, true); offset += 2;
    /* data chunk identifier */
    writeString(view, offset, 'data'); offset += 4;
    /* data chunk length */
    view.setUint32(offset, dataSize, true); offset += 4;

    // Write the PCM data
    floatTo16BitPCM(view, offset, buffer.getChannelData(0));

    return new Blob([bufferArray], { type: 'audio/wav' });
  }

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function floatTo16BitPCM(view, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  async function generateSSTVAudio(imageData, mode) {
    const sampleRate = getAudioContext().sampleRate;
    const audioData = []; // Array to store Float32Array chunks of audio

    // SSTV Mode Parameters (Martin 1 example)
    const SSTV_MODES = {
      'martin1': {
        WIDTH: 320,
        HEIGHT: 256,
        SCAN_TIME_MS: 146.432, // Total line time
        SYNC_FREQ: 1200,
        BLACK_FREQ: 1500,
        WHITE_FREQ: 2300,
        VIS_CODE: 0x2c, // 44 decimal
        SYNC_PULSE_MS: 5,
        FRONT_PORCH_MS: 0.572,
        COLOR_SCAN_MS: 4.5, // Per color component (G, B, R)
        VIS_START_FREQ: 1900, // VIS code start tone
        VIS_BIT_FREQ_0: 1100, // VIS code bit 0
        VIS_BIT_FREQ_1: 1300, // VIS code bit 1
        VIS_BIT_MS: 30, // Duration of each VIS bit
        VIS_STOP_FREQ: 1200, // VIS code stop tone
        VIS_STOP_MS: 30,
        CALIBRATION_BAR_MS: 300, // Calibration bar duration
        CALIBRATION_BAR_FREQ: 1500, // Calibration bar frequency
        CALIBRATION_BAR_STEP_MS: 10, // Step duration for calibration
      }
      // Add other modes here
    };

    const modeParams = SSTV_MODES[mode];
    if (!modeParams) {
      throw new Error(`Unsupported SSTV mode: ${mode}`);
    }

    const {
      WIDTH, HEIGHT, SYNC_FREQ, BLACK_FREQ, WHITE_FREQ, VIS_CODE,
      SYNC_PULSE_MS, FRONT_PORCH_MS, COLOR_SCAN_MS,
      VIS_START_FREQ, VIS_BIT_FREQ_0, VIS_BIT_FREQ_1, VIS_BIT_MS, VIS_STOP_FREQ, VIS_STOP_MS,
      CALIBRATION_BAR_MS, CALIBRATION_BAR_FREQ, CALIBRATION_BAR_STEP_MS
    } = modeParams;

    // Helper to generate a tone (sine wave)
    function generateTone(frequency, durationMs) {
      const durationSamples = Math.ceil(sampleRate * (durationMs / 1000));
      const buffer = new Float32Array(durationSamples);
      for (let i = 0; i < durationSamples; i++) {
        buffer[i] = Math.sin(2 * Math.PI * frequency * (i / sampleRate));
      }
      return buffer;
    }

    // Helper to convert RGB to YUV (BT.601 standard)
    function rgbToYuv(r, g, b) {
      const Y = 0.299 * r + 0.587 * g + 0.114 * b;
      const U = -0.147 * r - 0.289 * g + 0.436 * b;
      const V = 0.615 * r - 0.515 * g - 0.100 * b;
      return { Y, U, V };
    }

    // Resize image to SSTV resolution
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = WIDTH;
    tempCanvas.height = HEIGHT;
    const tempCtx = tempCanvas.getContext('2d');
    const img = new Image();
    img.src = URL.createObjectURL(new Blob([imageData.data], { type: 'image/png' })); // Assuming imageData.data is a Uint8ClampedArray
    await new Promise(resolve => img.onload = resolve);
    tempCtx.drawImage(img, 0, 0, WIDTH, HEIGHT);
    const resizedImageData = tempCtx.getImageData(0, 0, WIDTH, HEIGHT);

    // --- Generate Header (Calibration & VIS Code) ---

    // Calibration bars (simplified: just a single tone for a duration)
    encodingProgress.textContent = 'Generating calibration tones...';
    audioData.push(generateTone(CALIBRATION_BAR_FREQ, CALIBRATION_BAR_MS));

    // VIS Code (Vertical Interval Signaling)
    // Start bit (1900 Hz, 30ms)
    encodingProgress.textContent = 'Generating VIS code...';
    audioData.push(generateTone(VIS_START_FREQ, VIS_BIT_MS));

    // 7 data bits + 1 stop bit
    for (let i = 0; i < 7; i++) {
      const bit = (VIS_CODE >> i) & 1;
      audioData.push(generateTone(bit === 0 ? VIS_BIT_FREQ_0 : VIS_BIT_FREQ_1, VIS_BIT_MS));
    }
    // Stop bit (1200 Hz, 30ms)
    audioData.push(generateTone(VIS_STOP_FREQ, VIS_STOP_MS));

    // --- Generate Image Scanlines ---
    const totalLines = HEIGHT;
    const lineDurationMs = SYNC_PULSE_MS + FRONT_PORCH_MS + (COLOR_SCAN_MS * 3); // G, B, R

    for (let y = 0; y < totalLines; y++) {
      encodingProgress.textContent = `Processing line ${y + 1} of ${totalLines}...`;

      // Horizontal Sync Pulse
      audioData.push(generateTone(SYNC_FREQ, SYNC_PULSE_MS));

      // Front Porch
      audioData.push(generateTone(BLACK_FREQ, FRONT_PORCH_MS));

      // Scanline data (G, B, R components)
      const linePixels = [];
      for (let x = 0; x < WIDTH; x++) {
        const i = (y * WIDTH + x) * 4;
        const r = resizedImageData.data[i] / 255;
        const g = resizedImageData.data[i + 1] / 255;
        const b = resizedImageData.data[i + 2] / 255;
        linePixels.push(rgbToYuv(r, g, b));
      }

      // Transmit G, B, R components
      const colorComponents = ['U', 'V', 'Y']; // Order for Martin 1: G, B, R (Y, U, V)
      for (const component of colorComponents) {
        const componentSamples = [];
        const componentScanDurationMs = COLOR_SCAN_MS;
        const samplesPerComponent = Math.ceil(sampleRate * (componentScanDurationMs / 1000));

        for (let x = 0; x < WIDTH; x++) {
          const pixelYuv = linePixels[x];
          let value;
          if (component === 'Y') value = pixelYuv.Y;
          else if (component === 'U') value = pixelYuv.U;
          else if (component === 'V') value = pixelYuv.V;

          // Map YUV value to frequency range (1500-2300 Hz)
          // Y is 0-1, U/V are -0.436 to 0.615 (approx)
          // Normalize U/V to 0-1 range for frequency mapping
          let normalizedValue;
          if (component === 'Y') {
            normalizedValue = value;
          } else {
            // U range approx -0.436 to 0.436, V range approx -0.615 to 0.615
            // Map to 0-1 range: (value - min) / (max - min)
            const minVal = -0.615; // Max possible negative for U or V
            const maxVal = 0.615;  // Max possible positive for U or V
            normalizedValue = (value - minVal) / (maxVal - minVal);
            normalizedValue = Math.max(0, Math.min(1, normalizedValue)); // Clamp to be safe
          }

          const frequency = BLACK_FREQ + normalizedValue * (WHITE_FREQ - BLACK_FREQ);
          const pixelDurationMs = componentScanDurationMs / WIDTH;
          componentSamples.push(generateTone(frequency, pixelDurationMs));
        }
        audioData.push(...componentSamples);
      }
    }

    // Concatenate all audio buffers
    const totalSamples = audioData.reduce((sum, buf) => sum + buf.length, 0);
    const finalAudioBuffer = getAudioContext().createBuffer(1, totalSamples, sampleRate);
    const channelData = finalAudioBuffer.getChannelData(0);

    let offset = 0;
    for (const buffer of audioData) {
      channelData.set(buffer, offset);
      offset += buffer.length;
    }

    return finalAudioBuffer;
  }
});