let audioContext;

function initAudioContext() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playAudioBuffer(audioBuffer) {
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
}

function encodeImage() {
  const imageInput = document.getElementById('image-input');
  const encodingMode = document.getElementById('encoding-mode').value;
  const progressElem = document.getElementById('encoding-progress');

  const file = imageInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const width = img.width;
        const height = img.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, width, height).data;

        // Initialize audio context on user interaction
        if (!audioContext) {
          initAudioContext();
        }

        // Create and configure the worker
        const worker = new Worker('/sstv/worker.js');

        worker.onmessage = function(e) {
          if (e.data.type === 'progress') {
            updateProgress(e.data.progress);
          } else if (e.data.type === 'audioData') {
            const audioData = e.data.audioData;
            const audioBuffer = audioContext.createBuffer(1, audioData.length, audioContext.sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            channelData.set(audioData);

            playAudioBuffer(audioBuffer);
          }
        };

        worker.onerror = function(e) {
          console.error('Worker error:', e);
        };

        // Send the image data to the worker
        worker.postMessage({
          type: 'encode',
          imgData: imgData,
          width: width,
          height: height,
          encodingMode: encodingMode,
          sampleRate: audioContext.sampleRate
        });
      };
      img.src = e.target.result;
    }

    reader.readAsDataURL(file);
  }
}

function updateProgress(progress) {
  document.getElementById('encoding-progress').innerText = `Encoding: ${progress.toFixed(2)}%`;
}

function getImageData(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height).data;
}
